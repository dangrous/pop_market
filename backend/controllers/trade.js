const tradeRouter = require('express').Router()
const Trade = require('../models/trade')
const Song = require('../models/song')
const User = require('../models/user')

const setupTrade = async (body) => {
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

  return [user, song, price]
}

tradeRouter.post('/buy', async (req, res) => {
  const [user, song, price] = await setupTrade(req.body)

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
  const [user, song, price] = await setupTrade(req.body)

  let owned = false

  for (let s of user.songs) {
    if (s.song.toString() === song._id.toString()) {
      owned = true
      break
    }
  }

  if (!owned) {
    return res.status(400).json({
      error: 'user does not own song',
    })
  }

  const trade = new Trade({
    song: song._id,
    price,
    date: new Date(),
    user: user._id,
    action: 'SELL',
  })

  await trade.save()

  user.trades = user.trades.concat(trade._id)
  user.points = user.points + price
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
