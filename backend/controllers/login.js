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
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${config.CLIENT_ID}&redirect_uri=https%3A%2F%2Ffloating-earth-98213.herokuapp.com%2Fapi%2Flogin%2Fcallback`
  )
})

loginRouter.post('/logout', async (req, res) => {
  res.cookie('popMarketSession', null, {
    httpOnly: true,
    expires: new Date(0),
  })
  res.redirect('/')
})

const calculateNetWorth = (songs, points) => {
  let worth = points

  for (let song of songs) {
    // ! This is probably where i need to update curprice
    // ! if it's no longer in the list (probably need updateDate)
    worth += song.song.currentPrice
  }

  return worth
}

loginRouter.post('/tryspotify', async (req, res) => {
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
      // const songs = await helper.createPortfolio(user.trades)

      user.netWorth = calculateNetWorth(user.songs, user.points)

      await user.save()

      res.status(200).send(user)
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
        // ! This will need to not be hardcoded for deployment. Not quite sure how to do that.
        redirect_uri:
          'https://floating-earth-98213.herokuapp.com/api/login/callback',
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

module.exports = loginRouter
