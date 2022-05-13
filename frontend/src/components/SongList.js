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
      <div className='d-flex mt-1'>
        <h2 className='flex-grow-1 align-self-center'>
          Top 50 Songs on Spotify
          <small className='text-muted'> (Updated Daily)</small>
        </h2>
        <a
          className='btn btn-sm btn-outline-dark align-self-center'
          target='_blank'
          rel='noreferrer'
          href={
            'https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF?si=82ea55e8a9874e67'
          }
        >
          Listen on Spotify
        </a>
      </div>

      <ul className='list-group'>
        {songs.length !== 0 ? (
          songs.map((song, i) => {
            const songData = song.track

            return (
              <li className='list-group-item d-flex' key={songData.id}>
                <div className='col-xxl-auto fs-3 align-self-center'>
                  {i + 1}.
                  <img
                    src={songData.album.images[1].url}
                    alt={`Album cover art for "${songData.name}"`}
                    height={94}
                    className='mx-3'
                  />
                </div>
                <div className='flex-grow-1 align-self-center'>
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
                  <a
                    className='btn btn-sm btn-outline-dark'
                    target='_blank'
                    rel='noreferrer'
                    href={songData.external_urls.spotify}
                  >
                    Listen on Spotify
                  </a>
                </div>
                {user ? (
                  user.songs.findIndex(
                    (holding) => holding.song.spotifyId === songData.id
                  ) === -1 ? (
                    <div className='flex-shrink-0 align-self-center'>
                      <button
                        className='btn btn-primary btn-sm mt-2'
                        onClick={() => buySong(songData.id, 100 - i)}
                        disabled={user.points - (100 - i) < 0}
                      >
                        BUY This Song for {100 - i} Points!
                      </button>
                    </div>
                  ) : (
                    <div className='flex-shrink-0 align-self-center'>
                      <button
                        className='btn btn-info btn-sm mt-2'
                        onClick={() => sellSong(songData.id, 100 - i)}
                      >
                        SELL This Song for {100 - i} Points!
                      </button>
                    </div>
                  )
                ) : null}
              </li>
            )
          })
        ) : (
          <div class='alert alert-info' role='alert'>
            We're updating the song data for today - this might take up to 10
            seconds, so please be patient!
          </div>
        )}
      </ul>
    </div>
  )
}

export default SongList
