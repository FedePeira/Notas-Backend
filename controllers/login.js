const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const logger = require('../utils/logger')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    logger.info('POST /api/login log in')
    const { username, password } = request.body
    logger.info(request.body)

    const user = await User.findOne({ username })
    logger.info(user)

    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.password)
    logger.info(passwordCorrect)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }
    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(
        userForToken,
        process.env.SECRET
    )

    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
