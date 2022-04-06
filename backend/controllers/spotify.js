const spotifyRouter = require('express').Router()
const config = require('../utils/config')
const axios = require('axios')
const logger = require('../utils/logger')
const Song = require('../models/song')
const Cache = require('../models/cache')
const dummyData = require('../dummydata')

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

    for (let i = 0; i < playlistData.tracks.items.length; i++) {
      let currentSong = playlistData.tracks.items[i]

      let song = await Song.findOne({ spotifyId: currentSong.track.id })

      if (!song) {
        song = new Song({
          artist: currentSong.track.artists,
          title: currentSong.track.name,
          currentPrice: 100 - i,
          spotifyId: currentSong.track.id,
          lastUpdated: cacheDate,
          imageUrl: currentSong.track.album.images[1].url,
        })

        await song.save()
      } else {
        if (song.currentPrice != 100 - i) {
          song.currentPrice = 100 - i
          song.lastUpdated = cacheDate

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
