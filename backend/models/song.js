const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
  artist: {
    type: [Object],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  spotifyId: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
  },
  imageUrl: {
    type: String,
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
