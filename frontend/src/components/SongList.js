import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../reducers/userReducer'
import userService from '../services/user'

const SongList = () => {
  const songs = useSelector((state) => state.songs)
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const buySong = async (songId, price) => {
    console.log('You are buying a song!', songId)
    try {
      const updatedUser = await userService.buy(
        user.token,
        songId,
        price,
        user.email
      )
      dispatch(setUser(updatedUser))
    } catch (exception) {
      console.log('that didnt work right')
    }
  }

  // Repetitive code, also maybe a good use of Redux. i.e. dispatches seem good.
  const sellSong = async (songId, price) => {
    console.log('You are selling a song!', songId)
    try {
      const updatedUser = await userService.sell(
        user.token,
        songId,
        price,
        user.email
      )
      dispatch(setUser(updatedUser))
    } catch (exception) {
      console.log('that didnt work right')
    }
  }

  return (
    <div>
      <h3>Top Songs</h3>
      <ul>
        {songs
          ? songs.map((song, i) => {
              return (
                <li key={song.track.id}>
                  <strong>
                    #{i + 1}: {song.track.name}
                  </strong>{' '}
                  by{' '}
                  <em>
                    {song.track.artists.map((artist, i, artists) => {
                      if (i !== artists.length - 1) {
                        return artist.name + ', '
                      } else {
                        return artist.name
                      }
                    })}
                  </em>
                  {user ? (
                    user.portfolio.findIndex(
                      (holding) => holding.id === song.track.id
                    ) === -1 ? (
                      <button onClick={() => buySong(song.track.id, 100 - i)}>
                        BUY This Song for {100 - i} Points!
                      </button>
                    ) : (
                      <button onClick={() => sellSong(song.track.id, 100 - i)}>
                        SELL This Song for {100 - i} Points!
                      </button>
                    )
                  ) : null}
                </li>
              )
            })
          : null}
      </ul>
    </div>
  )
}

export default SongList
