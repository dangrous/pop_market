const tradeRouter = require('express').Router()
const Trade = require('../models/trade')
const Song = require('../models/song')
const User = require('../models/user')

tradeRouter.post('/buy', async (req, res) => {
  const body = req.body

  // TODO Verify user (token? cookie?)
  // TODO (This might modify below code as well)

  const user = await User.findOne({ email: body.email })

  if (!user) {
    return response.status(401).json({
      error: 'could not find the user',
    })
  }

  const song = await Song.findOne({ spotifyId: body.songId })

  if (!song) {
    return response.status(400).json({
      error: 'could not find the song',
    })
  }

  const price = song.currentPrice

  if (price > user.points) {
    return response.status(400).json({
      error: 'you do not have sufficient points',
    })
  }

  const trade = new Trade({
    song: song._id,
    price,
    date: new Date(),
    user: user._id,
    action: 'BUY',
  })

  await trade.save()

  user.trades = user.trades.concat(trade._id)
  user.points = user.points - price
  user.songs = user.songs.concat({
    song: song._id,
    purchasePrice: price,
  })
  await user.save()

  await user.populate({
    path: 'songs',
    populate: { path: 'song' },
  })

  res.status(200).send(user)
})

tradeRouter.post('/sell', async (req, res) => {
  const body = req.body

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

  // TODO Confirm user owns song
  // TODO Execute trade (create and save trade object)
  // TODO Update user (portfolio, points, trades, net worth)
})

module.exports = tradeRouter
