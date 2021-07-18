const mongoose  = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const Task = require('./task')



const userSchema =  new mongoose.Schema({
    name: {
        type: String,
        default: 'Anonymous', 
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is Invalid')
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should contain the word "password" ')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age should be positive')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar : {
        type: Buffer
    }
}, {
    timestamps: true
})

// Virtual relation with Task named tasks corresponding to field "owner"
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// This is called when the user is sent as a response
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.tokens
    delete userObject.password
    delete userObject.avatar

    return userObject
}


// To add a token to the user for Authantication -> Function defined for the instance ->methods
userSchema.methods.generateAuthToken = async function (email, password){
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_KEY , {"expiresIn": "15 days"})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

// For validation of user during log in -> Function defined for the model ->statics
userSchema.statics.findByCredentials= async (email, password)=>{

    const user = await User.findOne({email})
  
    if(!user){
        throw new Error('Unable to login!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login!')
    }
    return user
}

// Middleware: hash the password before saving
userSchema.pre('save', async function (next){
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Middleware: delete cascade for tasks and users
userSchema.pre('remove', async function (next){
    const user = this
    
    await Task.deleteMany({owner : user._id})

    next()
})

const User = mongoose.model('User', userSchema)


module.exports = User
