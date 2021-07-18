const app = require("./app")
const port = process.env.PORT

app.listen(port, ()=>{
    console.log("Port is up and running at :", port)
})
