require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false 
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
  }
]

// const http = require('http')
// const app = http.createServer( (request, response) => {
//   response.writeHead(200, {'Content-Type': 'text/plain'})
//   response.end(JSON.stringify(notes))
// })

// 改用 express
const app = express()
app.use(express.static('build')) // 后端部署静态文件
app.use(express.json()) // json-parser
app.use(cors()) // 跨来源(域)资源共享

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---')
  next()
}
app.use(requestLogger) // HTTP request 日志 中间件

// route handler
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  // response.json(notes)
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  // const note = notes.find(note => note.id === id)
  // if (note) {
  //   response.json(note)
  // } else {
  //   response.status(404).end()
  // }
  Note.findById(request.params.id).then(note => {
    if (note) {
      response.json(note)
    } else { // 没找到的话会报 CastError (promise reject) 直接进入 catch 而不会进入 else
      response.status(404).end()
    }
  }).catch(error => {
    // console.log(error)
    // response.status(400).send({error: 'malformatted id'})
    next(error)
  })
})

app.delete('/api/notes/:id', (request, response) => {
  // const id = Number(request.params.id)
  // notes = notes.filter(note => note.id !== id)
  // response.status(204).end()
  Note.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body
  // console(note)
  // response.json(note)
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })
  note.save()
    .then(savedNote => savedNote.toJson())
    .then(savedAndFormattedNote => {
      response.json(savedAndFormattedNote)
    })
    .catch(error => {
      next(error)
    })
})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body
  const note = {
    content: body.content,
    important: body.important
  }
  Note.findByIdAndUpdate(request.params.id, note, {new: true}).then(updateNote => {
    response.json(updateNote)
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error:'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler) // 将错误处理移入中间件

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`) 

// npm run dev