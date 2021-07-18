const request = require("supertest")
const app = require("../src/app")
const User = require("../src/models/user")
const {UserOne_id, userOne, setupDatabase} = require("./fixtures/db")

beforeEach(setupDatabase)

test("Should Signup a new user ", async () => {
    const response = await request(app).post("/users").send({
        name: "aryan",
        email: "aryanarushaag@gmail.com",
        password: "aryanpasss"
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name : "aryan",
            email: "aryanarushaag@gmail.com"
        },
        token : user.tokens[0].token
    })
})

test("Should login a  user one", async () => {
    const response = await request(app).post("/users/login").send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOne._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test("Should fail to login a user one", async () => {
    await request(app).post("/users/login").send({
        email: userOne.email,
        password: "nke sjnjv"
    }).expect(400)
})


test("Should get the profile for User one", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should fail to get the profile for User one: Invalid Token", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401)
})

test("Should delete the User One", async () => {
    await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOne._id)
    expect(user).toBeNull()
})

test("Should fail to delete the User One: Unauthorized", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)
})

test("Should upload avatar pic for valid user", async () => {
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/profile-pic.jpg")
        .expect(200)
    const user = await User.findById(userOne._id)
    expect(user.avatar).toEqual(expect.any(Buffer))
})


test("Should update valid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "updated"
        })
        .expect(200)
    const user = await User.findById(userOne._id)
    expect(user.name).toEqual("updated")
})


test("Should not update invalid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "updated"
        })
        .expect(400)
})