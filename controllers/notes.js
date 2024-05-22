const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

const getTokenFrom = request => {
    logger.info(request.get('authorization'))
    const authorization = request.get('authorization')
    logger.info('-------------')
    logger.info('Finding authorization...')
    logger.info(authorization)
    logger.info('-------------')
    logger.info(authorization && authorization.startsWith('Bearer '))
    if (authorization && authorization.startsWith('Bearer ')) {
        logger.info(authorization.replace('Bearer ', ''))
        return authorization.replace('Bearer ', '')
    }
    return null
}

/*
const authenticateToken = (request, response, next) => {
    try {
        const token = getTokenFrom(request)

        const decodedToken = jwt.decode(token, { complete: true })
        if (decodedToken.exp < Date.now() / 1000) {
            logger.info('El token ha expirado')
        } else {
            logger.info('El token no ha expirado')
        }
        logger.info('-----------')
        logger.info('Token: ', token)
        logger.info('----------')

        if (!token) {
            return response.status(401).json({ error: 'No token provided' })
        }
        // Aca no esta funcionando
        try {
            const decodedToken = jwt.verify(token, process.env.SECRET)
            // Continúa con tu lógica aqui
            logger.info('-----------')
            logger.info('Decoded Token: ', decodedToken)
            logger.info('----------')
            request.user = decodedToken
            next()
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                console.error('El token ha expirado:', error.message)
            } else if (error instanceof jwt.JsonWebTokenError) {
                console.error('Error de token JWT:', error.message)
            } else if (error instanceof jwt.NotBeforeError) {
                console.error('Error de fecha de inicio:', error.message)
            } else {
                console.error('Error desconocido:', error.message)
            }
        }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return response.status(401).json({ error: 'jwt malformed' })
        }
        return response.status(500).json({ error: 'Internal server error' })
    }
}
*/

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({}).populate('user')
    logger.info('Getting data successfull')
    response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
    const note = await Note.findById(request.params.id)
    if (note) {
        logger.info(`Getting ${request.params.id} successfull`)
        response.json(note)
    } else {
        response.status(404).end()
    }
})

notesRouter.post('/', async (request, response) => {
    const body = request.body

    logger.info('-------------')
    logger.info('Seing body...')
    logger.info(body)

    logger.info('-------------')
    logger.info('Seing request authorization...')
    logger.info(request.get('authorization'))
    logger.info('-------------')

    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

    logger.info('-------------')
    logger.info('Seing decodedToken...')
    logger.info(decodedToken)
    logger.info('-------------')

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const note = new Note({
        content: body.content,
        important: body.important === undefined ? false : body.important,
        user: user._id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    console.log('Creation successfull')
    response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
    await Note.findByIdAndDelete(request.params.id)
    console.log('Delete successfull')
    response.status(204).end()
})

notesRouter.put('/:id', async (request, response) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important,
    }

    const updatedNote = await Note.findByIdAndUpdate(request.params.id, note, { new: true })
    if(updatedNote) {
        console.log('Update successfull')
        response.status(200).json(updatedNote)
    } else {
        response.status(404).end()
    }
})

module.exports = notesRouter