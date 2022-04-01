const tradeRouter = require('express').Router()
const Trade = require('../models/trade')
const Song = require('../models/song')
const User = require('../models/user')
const logger = require('../utils/logger')

tradeRouter.post('/buy', async (req, res) => {
  const body = req.body

  // TODO Verify user (token? cookie?)
  // TODO (This might modify below code as well)

  const user = await User.findOne({ email: body.email })

  if (!user) {
    return res.status(401).json({
      error: 'could not find the user',
    })
  }

  const song = await Song.findOne({ spotifyId: body.songId })

  if (!song) {
    return res.status(400).json({
      error: 'could not find the song',
    })
  }

  const price = song.currentPrice

  if (price > user.points) {
    return res.status(400).json({
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
    return res.status(401).json({
      error: 'could not find the user',
    })
  }

  const song = await Song.findOne({ spotifyId: body.songId })

  if (!song) {
    return res.status(400).json({
      error: 'could not find the song',
    })
  }

  const price = song.currentPrice

  // TODO Confirm user owns song

  const trade = new Trade({
    song: song._id,
    price,
    date: new Date(),
    user: user._id,
    action: 'SELL',
  })

  await trade.save()

  logger.info('song to remove', song._id.toString())

  user.songs.map((s) => {
    logger.info(s.song.toString())
    logger.info(s.song.toString() === song._id.toString())
  })

  user.trades = user.trades.concat(trade._id)
  user.points = user.points + price
  logger.info(user.songs.length, 'before drop')
  user.songs = user.songs.filter(
    (s) => s.song.toString() !== song._id.toString()
  )
  await user.save()

  await user.populate({
    path: 'songs',
    populate: { path: 'song' },
  })

  res.status(200).send(user)
})

module.exports = tradeRouter
