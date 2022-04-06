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
      const updatedUser = await userService.buy(songId, price, user.email)
      dispatch(setUser(updatedUser))
    } catch (exception) {
      console.log('something went wrong')
    }
  }

  // Repetitive code, also maybe a good use of Redux. i.e. dispatches seem good.
  const sellSong = async (songId, price) => {
    console.log('You are selling a song!', songId)
    try {
      const updatedUser = await userService.sell(songId, price, user.email)
      dispatch(setUser(updatedUser))
    } catch (exception) {
      console.log('that didnt work right')
    }
  }

  return (
    <div>
      <h2>
        Top 50 Songs on Spotify
        <small className='text-muted'> (Updated Daily)</small>
      </h2>
      <ul className='list-group'>
        {songs
          ? songs.map((song, i) => {
              const songData = song.track

              return (
                <li className='list-group-item ps-2' key={songData.id}>
                  <div className='row'>
                    <div className='col-xxl-auto fs-3'>
                      {i + 1}.
                      <img
                        src={songData.album.images[1].url}
                        alt={`Album cover art for "${songData.name}"`}
                        height={94}
                        className='ms-1'
                      />
                    </div>
                    <div className='col-9'>
                      <strong>{songData.name}</strong>
                      <br />
                      <em>
                        {songData.artists.map((artist, i, artists) => {
                          if (i !== artists.length - 1) {
                            return artist.name + ', '
                          } else {
                            return artist.name
                          }
                        })}
                      </em>
                      <br />
                      {user ? (
                        user.songs.findIndex(
                          (holding) => holding.song.spotifyId === songData.id
                        ) === -1 ? (
                          <button
                            className='btn btn-primary btn-sm mt-2'
                            onClick={() => buySong(songData.id, 100 - i)}
                            disabled={user.points - (100 - i) < 0}
                          >
                            BUY This Song for {100 - i} Points!
                          </button>
                        ) : (
                          <button
                            className='btn btn-info btn-sm mt-2'
                            onClick={() => sellSong(songData.id, 100 - i)}
                          >
                            SELL This Song for {100 - i} Points!
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })
          : null}
      </ul>
    </div>
  )
}

export default SongList
