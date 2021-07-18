const express = require('express');
const sharp = require('sharp')
const User = require('../models/user')
const userRouter = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')


userRouter.post('/users', async (req, res)=>{

    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e){
        res.status(400).send(e)
    }
})

userRouter.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

userRouter.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

userRouter.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})



userRouter.get('/users/me', auth, async (req, res)=>{
    res.send(req.user)
})


userRouter.patch('/users/me', auth, async  (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send({'error': 'Invalid Updates'})
    }

    try{
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }

})

userRouter.delete('/users/me', auth, async  (req, res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter(req, file , cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload a valid Image'))
        }  
        cb(undefined, true)
    }
})

userRouter.post('/users/me/avatar', auth , upload.single('avatar'),  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({height: 500, width: 500 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

userRouter.delete('/users/me/avatar', auth ,  async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

userRouter.get('/users/:id/avatar', async (req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        // console.log(user)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png').send(user.avatar)
    }catch(e){
        res.status(404).send()
    }    
})

module.exports = userRouter