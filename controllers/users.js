const bcrypt = require('bcryptjs')
const logger = require('../utils/logger')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    logger.info('POST /api/users endpoint hit')

    const { username, name, password } = request.body
    logger.info('---------------------------')
    logger.info('Request body: ', request.body)
    logger.info('---------------------------')

    if (password.length < 3) {
        return response.status(400).json({ error: 'password too short' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    logger.info('Password sin hash: ' + password)
    logger.info('Password hasheada: ' + passwordHash)

    const user = new User({
        username: username,
        name: name,
        password: passwordHash
    })

    const savedUser = await user.save()
    logger.info('Creation successfull: ', savedUser)
    response.status(201).json(savedUser)
})

usersRouter.get('/', async(request, response) => {
    const users = await User.find({}).populate('notes')
    response.json(users)
})

module.exports = usersRouter