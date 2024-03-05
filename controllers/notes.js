const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', (request, response) => {
    Note.find({}).then(notes => {
        console.log('Getting data successfull')
        response.json(notes)
    })
})

notesRouter.get('/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                console.log(`Getting ${request.params.id} successfull`)
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

notesRouter.post('/', (request, response, next) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
        .then(savedNote => {
            console.log('Creation successfull')
            response.json(savedNote)
        })
        .catch(error => next(error))
})

notesRouter.delete('/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(() => {
            console.log('Delete successfull')
            response.status(204).end()
        })
        .catch(error => next(error))
})

notesRouter.put('/:id', (request, response, next) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            console.log('Update successfull')
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

module.exports = notesRouter