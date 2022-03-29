const Song = require('../models/song')

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const createPortfolio = async (trades) => {
  const ownedIds = []
  const soldIds = []
  const songs = []

  trades.reverse()

  await asyncForEach(trades, async (trade) => {
    if (!ownedIds.includes(trade.song) && !soldIds.includes(trade.song)) {
      if (trade.action === 'BUY') {
        ownedIds.push(trade.song)

        let song = await Song.findOne({ spotifyId: trade.song })

        console.log(song)

        songs.push({
          id: trade.song,
          purchasePrice: trade.price,
          currentPrice: song.currentPrice,
        })
      } else {
        soldIds.push(trade.song)
      }
    }
  })

  // trades.forEach(async (trade) => {
  //   if (!ownedIds.includes(trade.song) && !soldIds.includes(trade.song)) {
  //     if (trade.action === 'BUY') {
  //       ownedIds.push(trade.song)

  //       // let song = await Song.findOne({ spotifyId: trade.song })

  //       songs.push({
  //         id: trade.song,
  //         purchasePrice: trade.price,
  //         currentPrice: 45, // TODO NEED TO WORK ON ASYNC TO MAKE THIS REAL
  //       })
  //     } else {
  //       soldIds.push(trade.song)
  //     }
  //   }
  // })

  return songs
}

module.exports = {
  createPortfolio,
}
