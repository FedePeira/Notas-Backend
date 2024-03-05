const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({})
    console.log('Getting data successfull')
    response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
    const note = await Note.findById(request.params.id)
    if (note) {
        console.log(`Getting ${request.params.id} successfull`)
        response.json(note)
    } else {
        response.status(404).end()
    }
})

notesRouter.post('/', async (request, response) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    const savedNote = await note.save()
    console.log('Creation successfull')
    response.json(savedNote)
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
        response.json(updatedNote)
    } else {
        response.status(404).end()
    }
})

module.exports = notesRouter