const mongoose = require('mongoose')

// connect MongoDB
const url = process.env.MONGODB_URI
console.log('connecting to ', url)

mongoose.connect(url).then(result => {
  console.log('connected to MongoDB')
}).catch( error => {
  console.log('error connecting to MongoDB:', error.message)
})

// define schema
const noteSchema = new mongoose.Schema({
  // 使用 Mongoose 的 validation
  content: {
    type: String,
    minlength: 5,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  important: Boolean
})

// modify schema toJson method
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)