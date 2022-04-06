const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
})

songSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Song = mongoose.model('Song', songSchema)

module.exports = Song
