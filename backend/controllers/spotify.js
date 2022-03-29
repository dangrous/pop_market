const spotifyRouter = require('express').Router()
const config = require('../utils/config')
const axios = require('axios')
const logger = require('../utils/logger')
const Song = require('../models/song')
const Cache = require('../models/cache')
const dummyData = require('../dummydata')

const auth_token = Buffer.from(
  `${config.CLIENT_ID}:${config.CLIENT_SECRET}`,
  'utf-8'
).toString('base64')

const grantType = {
  grant_type: 'client_credentials',
}

spotifyRouter.get('/', async (req, res) => {
  let cache = await Cache.findOne({})

  if (
    !cache ||
    cache.date < new Date(new Date().getTime() - 60 * 60 * 24 * 1000)
  ) {
    logger.info('going to call spotify')
    const token_url = 'https://accounts.spotify.com/api/token'

    const response = await axios
      .post('https://accounts.spotify.com/api/token', null, {
        params: {
          client_id: config.CLIENT_ID,
          client_secret: config.CLIENT_SECRET,
          grant_type: 'client_credentials',
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .catch((error) => {
        console.log(error)
      })

    const token = response.data.access_token

    const playlist = await axios.get(
      'https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF',
      {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      }
    )

    const playlistData = playlist.data

    if (!cache) {
      cache = new Cache({
        date: new Date(),
        playlist: playlistData,
      })
    } else {
      cache.date = new Date()
      cache.playlist = playlistData
    }

    await cache.save()

    for (let i = 0; i < playlistData.tracks.items.length; i++) {
      let currentSong = playlistData.tracks.items[i]

      let song = await Song.findOne({ spotifyId: currentSong.track.id })

      if (!song) {
        song = new Song({
          artist: currentSong.track.artists,
          title: currentSong.track.name,
          currentPrice: 100 - i,
          spotifyId: currentSong.track.id,
        })

        await song.save()
      } else {
        if (song.currentPrice != 100 - i) {
          song.currentPrice = 100 - i

          await song.save()
        }
      }
    }

    res.send(playlistData)
  } else {
    logger.info('going to use cached value')
    res.send(cache.playlist)
  }
})

module.exports = spotifyRouter
