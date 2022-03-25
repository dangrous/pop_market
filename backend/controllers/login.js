const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')
const config = require('../utils/config')
const Song = require('../models/song')
const helper = require('../utils/helpers')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ email: body.email }).populate('trades')
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

  // TODO look at this - https://gist.github.com/Atinux/fd2bcce63e44a7d3addddc166ce93fb2
  const songs = await helper.createPortfolio(user.trades)

  response.status(200).send({
    token,
    email: user.email,
    points: user.points,
    netWorth: 10,
    portfolio: songs,
  })
})

module.exports = loginRouter
