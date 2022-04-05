const Song = require('../models/song')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Cache = require('../models/cache')
const config = require('../utils/config')
const axios = require('axios')
const logger = require('../utils/logger')

const calculateNetWorth = (songs, points) => {
  let worth = points

  for (let song of songs) {
    // ! This is probably where i need to update curprice
    // ! if it's no longer in the list (probably need updateDate)
    worth += song.song.currentPrice
  }

  return worth
}

usersRouter.get('/oauth', (req, res) => {
  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${config.CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fusers%2Fcallback`
  )
})

usersRouter.post('/logout', async (req, res) => {
  res.cookie('popMarketSession', null, {
    httpOnly: true,
    expires: new Date(0),
  })
  res.redirect('/')
})

usersRouter.post('/login', async (req, res) => {
  if (!req.cookies || !req.cookies.popMarketSession) {
    res.send(null)
  } else {
    logger.error('found user!')
    const user = await User.findOne({
      email: req.cookies.popMarketSession,
    }).populate({
      path: 'songs',
      populate: { path: 'song' },
    })

    if (!user) {
      res.send(null)
    } else {
      user.netWorth = calculateNetWorth(user.songs, user.points)

      await user.save()

      res.status(200).send(user)
    }
  }
})

usersRouter.get('/callback', async (req, res) => {
  const code = req.query.code || null

  const auth = Buffer.from(
    `${config.CLIENT_ID}:${config.CLIENT_SECRET}`,
    'utf8'
  ).toString('base64')

  const response = await axios
    .post('https://accounts.spotify.com/api/token', null, {
      params: {
        code: code,
        // ! This will need to not be hardcoded for deployment. Not quite sure how to do that.
        redirect_uri: 'http://localhost:3001/api/users/callback',
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .catch((error) => {
      logger.error(error)
    })

  console.log(response.data)

  const token = response.data.access_token

  const user = await axios.get('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
  })

  console.log(user.data)

  const existingUser = await User.findOne({ email: user.data.id })

  if (!existingUser) {
    const newUser = new User({
      email: user.data.id,
      points: 1000,
      createDate: new Date(),
      display_name: user.data.display_name,
      netWorth: 1000,
    })

    const savedUser = await newUser.save()
  }

  res.cookie('popMarketSession', user.data.id, {
    httpOnly: true,
    maxAge: 360000,
  })
  // ! This redirects to the built version which is not great for testing. How fix?
  res.redirect('/')
})

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
