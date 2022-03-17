const mongoose = require('mongoose')

const schema = new mongoose.Schema({
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
})

module.exports = mongoose.model('User', schema)
