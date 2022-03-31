const mongoose = require('mongoose')

const ownedSongSchema = mongoose.Schema({
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
})

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 3,
  },
  points: {
    type: Number,
    required: true,
  },
  createDate: {
    type: Date,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  display_name: {
    type: String,
  },
  trades: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
    },
  ],
  songs: {
    type: [ownedSongSchema],
    required: true,
  },
  netWorth: {
    type: Number,
    required: true,
  },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
