const tradeRouter = require('express').Router()
const Trade = require('../models/trade')
const User = require('../models/user')
const logger = require('../utils/logger')
const helper = require('../utils/helpers')

tradeRouter.post('/buy', async (request, response) => {
  logger.info('attempting to buy a song')

  const body = request.body

  const user = await User.findOne({ email: body.email })

  if (!user) {
    return response.status(401).json({
      error: 'could not find the user',
    })
  }

  if (body.price > user.points) {
    return response.status(400).json({
      error: 'you do not have sufficient points',
    })
  }

  const trade = new Trade({
    song: body.songId,
    price: body.price,
    date: new Date(),
    user: user._id,
    action: 'BUY',
  })

  const savedTrade = await trade.save()
  user.trades = user.trades.concat(savedTrade._id)
  user.points = user.points - body.price
  user.songs = user.songs.concat(body.songId)
  await user.save()

  // ! Don't do this
  const updatedUser = await User.findOne({ email: body.email }).populate(
    'trades'
  )

  const songs = await helper.createPortfolio(updatedUser.trades)

  response.status(200).send({
    token: body.token,
    email: user.email,
    points: user.points,
    portfolio: songs,
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

  const trade = new Trade({
    song: body.songId,
    price: body.price,
    date: new Date(),
    user: user._id,
    action: 'SELL',
  })

  const savedTrade = await trade.save()

  user.trades = user.trades.concat(savedTrade._id)
  user.points = user.points + body.price
  user.songs = user.songs.filter((song) => song !== body.songId)
  await user.save()

  // ! Don't do this
  const updatedUser = await User.findOne({ email: body.email }).populate(
    'trades'
  )

  const songs = await helper.createPortfolio(updatedUser.trades)

  response.status(200).send({
    token: body.token,
    email: user.email,
    points: user.points,
    portfolio: songs,
  })
})

module.exports = tradeRouter
