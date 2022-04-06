const Song = require('../models/song')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Cache = require('../models/cache')
const config = require('../utils/config')
const axios = require('axios')
const logger = require('../utils/logger')
const { response } = require('express')
const jwt = require('jsonwebtoken')

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
    logger.info('no cookie sent')
    res.send(null)
  } else {
    logger.info('finding user...')
    const decodedUser = jwt.verify(req.cookies.popMarketSession, config.SECRET)

    if (!decodedUser.id) {
      res.send(null)
    }

    logger.info('user id found...')

    const user = await User.findOne({
      email: decodedUser.id,
    }).populate({
      path: 'songs',
      populate: { path: 'song' },
    })

    if (!user) {
      logger.info('user not found')
      res.send(null)
    } else {
      logger.info('user found!')
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

  const token = response.data.access_token

  const user = await axios.get('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
  })

  const existingUser = await User.findOne({ email: user.data.id })

  if (!existingUser) {
    const newUser = new User({
      email: user.data.id,
      points: 1000,
      createDate: new Date(),
      display_name: user.data.display_name,
      netWorth: 1000,
    })

    await newUser.save()
  }

  const userForToken = {
    id: user.data.id,
  }

  const userToken = jwt.sign(userForToken, config.SECRET)

  res.cookie('popMarketSession', userToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
  // ! This redirects to the built version which is not great for testing. How fix?
  res.redirect('/')
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  users.sort((a, b) => {
    return b.netWorth - a.netWorth
  })

  response.json(users)
})

module.exports = usersRouter
