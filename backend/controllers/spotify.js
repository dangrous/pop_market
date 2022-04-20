const spotifyRouter = require('express').Router()
const config = require('../utils/config')
const axios = require('axios')
const logger = require('../utils/logger')
const Song = require('../models/song')
const Cache = require('../models/cache')
const dummyData = require('../dummydata')
const User = require('../models/user')

// The following function is mostly for testing, so use sparingly!
// spotifyRouter.get('/deletesongs', async (req, res) => {
//   await Song.deleteMany({})

//   const test = await Song.find({})
//   res.send(test.data)
// })

spotifyRouter.get('/', async (req, res) => {
  let cache = await Cache.findOne({})

  if (
    !cache ||
    cache.date < new Date(new Date().getTime() - 60 * 60 * 24 * 1000)
  ) {
    logger.info('going to call spotify')
    const token_url = 'https://accounts.spotify.com/api/token'

    const response = await axios
      .post(token_url, null, {
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
        logger.error(error)
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

    // const playlistData = dummyData.dummyData
    const playlistData = playlist.data

    const cacheDate = new Date(playlistData.tracks.items[0].added_at)

    const updated = []

    for (let i = 0; i < playlistData.tracks.items.length; i++) {
      let currentSong = playlistData.tracks.items[i]

      let song = await Song.findOne({ spotifyId: currentSong.track.id })

      if (!song) {
        song = new Song({
          spotifyId: currentSong.track.id,
          data: currentSong.track,
          currentPrice: 100 - i,
          lastUpdated: cacheDate,
        })

        await song.save()
      } else {
        if (song.currentPrice != 100 - i) {
          song.currentPrice = 100 - i
          song.lastUpdated = cacheDate

          await song.save()
        }
      }

      updated.push(currentSong.track.id)
    }

    const users = await User.find({})

    for (let user of users) {
      if (user.lastUpdated && user.lastUpdated >= cacheDate) {
        continue
      }

      let netWorth = user.points

      for (let song of user.songs) {
        if (song.song) {
          let existingSong = await Song.findById(song.song)

          // ! Bad
          if (!existingSong) {
            continue
          }

          if (updated.indexOf(existingSong.spotifyId) > -1) {
            netWorth += existingSong.currentPrice
          } else {
            existingSong.currentPrice = 25
            existingSong.lastUpdated = cacheDate
            await existingSong.save()
            netWorth += existingSong.currentPrice
          }
        }
      }

      user.netWorth = netWorth
      user.lastupdated = cacheDate
      await user.save()
    }

    if (!cache) {
      cache = new Cache({
        date: cacheDate,
        playlist: playlistData,
      })
    } else {
      cache.date = cacheDate
      cache.playlist = playlistData
    }

    await cache.save()

    res.send(playlistData)
  } else {
    logger.info('going to use cached value')
    res.send(cache.playlist)
  }
})

module.exports = spotifyRouter
