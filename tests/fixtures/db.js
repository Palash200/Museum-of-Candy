const User = require("../../src/models/user")
const Task = require("../../src/models/task")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")



const UserOne_id = new mongoose.Types.ObjectId()
userOne = {
    _id : UserOne_id,
    name: "testuser1",
    email: "testuser1@gmail.com",
    password: "testuser1", 
    tokens:[{
        token: jwt.sign({_id: UserOne_id}, process.env.JWT_KEY , {"expiresIn": "15 days"})
    }]
}

const UserTwo_id = new mongoose.Types.ObjectId()
userTwo = {
    _id : UserTwo_id,
    name: "testuser2",
    email: "testuser2@gmail.com",
    password: "testuser2", 
    tokens:[{
        token: jwt.sign({_id: UserTwo_id}, process.env.JWT_KEY , {"expiresIn": "15 days"})
    }]
}

taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task One",
    completed: false,
    owner: UserOne_id
}

taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task Two",
    completed: true,
    owner: UserOne_id
}

taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task Three",
    completed: true,
    owner: UserTwo_id
}

const setupDatabase = async ()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    UserOne_id,
    UserTwo_id, 
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}