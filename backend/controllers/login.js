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
  console.log('in regular route')
  console.log(JSON.stringify(request.cookies.popMarketSession))
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

loginRouter.post('/logout', async (req, res) => {
  res.cookie('popMarketSession', null, {
    httpOnly: true,
    expires: new Date(0),
  })
  res.redirect('/')
})

loginRouter.post('/tryspotify', async (req, res) => {
  if (!req.cookies || !req.cookies.popMarketSession) {
    res.send(null)
  } else {
    const user = await User.findOne({ email: req.cookies.popMarketSession })

    if (!user) {
      res.send(null)
    } else {
      const songs = await helper.createPortfolio(user.trades)

      res.status(200).send({
        token: 'asdas',
        email: user.email,
        points: user.points,
        netWorth: 10,
        portfolio: songs,
        display_name: user.display_name,
      })
    }
  }

  // console.log(req.cookies)
  // if (!request.cookies) {
  //   logger.error('no cookies provided')
  // }
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
      passwordHash: 'poop',
      display_name: user.data.display_name,
    })

    const savedUser = await newUser.save()
  }

  res.cookie('popMarketSession', user.data.id, {
    httpOnly: true,
    maxAge: 360000,
  })
  res.redirect('/')
})

module.exports = loginRouter
