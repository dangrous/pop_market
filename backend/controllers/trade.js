const tradeRouter = require('express').Router()
const Trade = require('../models/trade')
const User = require('../models/user')
const logger = require('../utils/logger')

tradeRouter.post('/buy', async (request, response) => {
  logger.info('attempting to buy a song')

  const body = request.body

  const user = await User.findOne({ email: body.email })

  if (!user) {
    return response.status(401).json({
      error: 'could not find the user',
    })
  }

  const trade = new Trade({
    song: body.songId,
    price: body.price,
    date: new Date(),
    user: user._id,
  })

  const savedTrade = await trade.save()
  user.trades = user.trades.concat(savedTrade._id)
  user.points = user.points - body.price
  user.songs = user.songs.concat(body.songId)
  await user.save()

  response.status(200).send({
    token: body.token,
    email: user.email,
    points: user.points,
    songs: user.songs,
  })
})

tradeRouter.post('/sell', async (request, response) => {
  logger.info('attempting to sell a song')

  const body = request.body

  const user = await User.findOne({ email: body.email })

  if (!user) {
    return response.status(401).json({
      error: 'could not find the user',
    })
  }

  // TODO Trade needs direction!
  const trade = new Trade({
    song: body.songId,
    price: body.price,
    date: new Date(),
    user: user._id,
  })

  const savedTrade = await trade.save()
  user.trades = user.trades.concat(savedTrade._id)
  user.points = user.points + body.price
  user.songs = user.songs.map((song) => (song !== body.songId ? song : null))
  await user.save()

  response.status(200).send({
    token: body.token,
    email: user.email,
    points: user.points,
    songs: user.songs,
  })
})

module.exports = tradeRouter
