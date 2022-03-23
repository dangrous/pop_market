const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')
const config = require('../utils/config')

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

  const ownedIds = []
  const soldIds = []
  const songs = []
  let songWorth = 0

  user.trades.reverse()

  user.trades.forEach((trade) => {
    if (!ownedIds.includes(trade.song) && !soldIds.includes(trade.song)) {
      if (trade.action === 'BUY') {
        ownedIds.push(trade.song)
        songs.push({
          id: trade.song,
          purchasePrice: trade.price,
          currentPrice: 100, // But actually make this real?
        })
      } else {
        soldIds.push(trade.song)
      }
    }
  })

  response.status(200).send({
    token,
    email: user.email,
    points: user.points,
    netWorth: 10,
    portfolio: songs,
  })
})

module.exports = loginRouter
