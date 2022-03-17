const express = require('express') // Express web server framework
const request = require('request') // "Request" library
const axios = require('axios')
const cors = require('cors')
const querystring = require('querystring')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
require('dotenv').config()

const User = require('./models/user')

const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const CLIENT_ID = process.env.CLIENT_ID // Your client id
const CLIENT_SECRET = process.env.CLIENT_SECRET // Your secret
const redirect_uri = 'http://localhost:3001/callback' // Your redirect uri

// ! DO I NEED THIS
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
  var text = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

var stateKey = 'spotify_auth_state'

var app = express()

app
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())

app.get('/users', async (req, res) => {
  const users = await User.find({})

  console.log(users)
  res.send(users)
})

app.get('/login', function (req, res) {
  var state = generateRandomString(16)
  res.cookie(stateKey, state)

  // your application requests authorization
  var scope = 'user-read-private user-read-email'

  const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`

  res.redirect(url)
})

app.get('/callback', async (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null
  var state = req.query.state || null
  var storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect('/#error=state_mismatch')
  } else {
    res.clearCookie(stateKey)
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      },
      json: true,
    }

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true,
        }

        // use the access token to access the Spotify Web API
        request.get(options, async function (error, response, body) {
          let user = await User.findOne({ email: body.email })

          if (!user) {
            console.log('creating a new user')
            const newUser = new User({
              email: body.email,
              points: 1000,
              createDate: new Date(),
            })

            await newUser.save()

            user = newUser
          }

          console.log(user)
        })

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          `/#&access_token=${access_token}&refresh_token=${refresh_token}`
        )
      } else {
        res.redirect('/#error=invalid_token')
      }
    })
  }
})

app.get('/refresh_token', function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token
      res.send({
        access_token: access_token,
      })
    }
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
