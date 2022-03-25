const mongoose = require('mongoose')

const cacheSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  playlist: {
    type: Object,
    required: true,
  },
})

const Cache = mongoose.model('Cache', cacheSchema)

module.exports = Cache
