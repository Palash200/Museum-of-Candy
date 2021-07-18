const express = require('express');
require('./db/mongoose')
const taskRouter = require('./routers/task')
const userRouter = require('./routers/user')

const app = express()

// app.use((req, res, next)=>{
//     console.log(req)
//     next()
//     // res.status(503).send('Server is in Maintanenece, Please try after some time.')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app