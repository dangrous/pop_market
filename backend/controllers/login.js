const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')
const config = require('../utils/config')
const Song = require('../models/song')
const helper = require('../utils/helpers')
const axios = require('axios')

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

  const songs = await helper.createPortfolio(user.trades)

  response.status(200).send({
    token,
    email: user.email,
    points: user.points,
    netWorth: 10,
    portfolio: songs,
  })
})

loginRouter.get('/oauth', (req, res) => {
  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${config.CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Flogin%2Fcallback`
  )
})

loginRouter.get('/callback', async (req, res) => {
  const code = req.query.code || null

  const auth = Buffer.from(
    `${config.CLIENT_ID}:${config.CLIENT_SECRET}`,
    'utf8'
  ).toString('base64')

  const response = await axios
    .post('https://accounts.spotify.com/api/token', null, {
      params: {
        code: code,
        redirect_uri: 'http://localhost:3001/api/login/callback',
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

  res.send(user.data)
})

module.exports = loginRouter
