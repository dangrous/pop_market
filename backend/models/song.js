const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: true,
  },
  title: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
})

tradeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Song = mongoose.model('Song', songSchema)

module.exports = Song
