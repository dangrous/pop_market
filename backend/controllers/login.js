const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ email: body.email })
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, config.SECRET, {
    expiresIn: 60 * 60,
  })

  response.status(200).send({
    token,
    email: user.email,
    points: user.points,
    songs: user.songs,
  })
})

module.exports = loginRouter
