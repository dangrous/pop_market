const Song = require('../models/song')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Cache = require('../models/cache')
const logger = require('../utils/logger')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  const cache = await Cache.findOne({})

  const cacheDate = cache ? cache.date : new Date()

  for (let user of users) {
    if (user.lastUpdated && user.lastUpdated >= cacheDate) {
      continue
    }

    let netWorth = user.points

    for (let song of user.songs) {
      if (song.song) {
        let existingSong = await Song.findById(song.song)

        if (existingSong.lastUpdated && existingSong.lastUpdated >= cacheDate) {
          netWorth += existingSong.currentPrice
        } else {
          // ! This can be cleaned up
          existingSong.currentPrice = 25
          existingSong.lastUpdated = cacheDate
          await existingSong.save()
          netWorth += 25
        }
      }
    }
    logger.info(netWorth)
    user.netWorth = netWorth
    logger.info(user.netWorth)
    user.lastUpdated = cacheDate
    await user.save()
  }

  users.sort((a, b) => {
    return b.netWorth - a.netWorth
  })

  response.json(users)
})

module.exports = usersRouter
