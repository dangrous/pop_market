const tradeRouter = require('express').Router()
const Trade = require('../models/trade')
const Song = require('../models/song')
const User = require('../models/user')
const helper = require('../utils/helpers')
const { response } = require('express')

tradeRouter.post('/buy', async (req, res) => {
  const body = request.body

  // TODO Verify user (token? cookie?)
  // TODO (This might modify below code as well)

  const user = await User.findOne({ email: body.email })

  if (!user) {
    return response.status(401).json({
      error: 'could not find the user',
    })
  }

  const song = await Song.findById(body.songId)

  if (!song) {
    return response.status(400).json({
      error: 'could not find the song',
    })
  }

  // ! Will need to make sure this gets updated if a song is owned and wasn't picked up
  // ! in the last playlist update
  const price = song.currentPrice

  if (price > user.points) {
    return response.status(400).json({
      error: 'you do not have sufficient points',
    })
  }

  const trade = new Trade({
    // ! Will need to adjust schema to take refs, not strings
    song: song._id,
    price,
    date: new Date(),
    user: user._id,
    action: 'BUY',
  })

  await trade.save()

  // TODO Update user (portfolio, points, trades, net worth)
  // ! Not sure if this will successfully pull the id
  user.trades = user.trades.concat(trade._id)
  user.points = user.points - price
  user.save()
  // ? I think this should work
  user.populate('trades')

  const songs = await helper.createPortfolio(updatedUser.trades)

  response.status(200).send({
    // ? I don't think we need the token anymore
    email: user.email,
    points: user.points,
    portfolio: songs,
  })
})

tradeRouter.post('/sell', async (req, res) => {
  // TODO Verify user (token? cookie?)
  // TODO Confirm song exists, get current price
  // TODO Confirm user owns song
  // TODO Execute trade (create and save trade object)
  // TODO Update user (portfolio, points, trades, net worth)
})

module.exports = tradeRouter
