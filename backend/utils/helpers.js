const createPortfolio = async (trades) => {
  const ownedIds = []
  const soldIds = []
  const songs = []

  trades.reverse()

  trades.forEach(async (trade) => {
    if (!ownedIds.includes(trade.song) && !soldIds.includes(trade.song)) {
      if (trade.action === 'BUY') {
        ownedIds.push(trade.song)

        // let song = await Song.findOne({ spotifyId: trade.song })

        songs.push({
          id: trade.song,
          purchasePrice: trade.price,
          currentPrice: 45, // TODO NEED TO WORK ON ASYNC TO MAKE THIS REAL
        })
      } else {
        soldIds.push(trade.song)
      }
    }
  })

  return songs
}

module.exports = {
  createPortfolio,
}
