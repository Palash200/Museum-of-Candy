const request = require("supertest")
const app = require("../src/app")
const Task = require("../src/models/task")
const {
    UserOne_id, 
    UserTwo_id,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
} = require("./fixtures/db")

beforeEach(setupDatabase)


test("Should create a new task for Authonticated User", async ()=>{
    const response = await request(app)
            .post('/tasks')
            .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: "Test task create"
            })
            .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
    expect(task.description).toEqual("Test task create")
})

test("Should fetch user tasks", async ()=>{
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body.length).toEqual(2)
})


test("Should not delete other user tasks", async ()=>{
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

