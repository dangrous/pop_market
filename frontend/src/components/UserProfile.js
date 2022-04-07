import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../reducers/userReducer'
import userService from '../services/user'

const OwnedSong = ({ song, sell }) => {
  const profit = song.song.currentPrice - song.purchasePrice

  const percentage = profit / song.purchasePrice

  let background = ''

  if (profit > 0) {
    background = ' bg-success'
  }

  if (profit < 0) {
    background = ' bg-danger'
  }

  const songData = song.song.data

  return (
    <li className={'list-group-item d-flex' + background}>
      <div className='col-xxl-auto fs-3 align-self-center'>
        <img
          src={songData.album.images[1].url}
          alt={`Album cover art for "${songData.name}"`}
          height={94}
          className='me-3'
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
        Current Value: {song.song.currentPrice} - Purchased at:{' '}
        {song.purchasePrice} - Profit: {profit} or{' '}
        {percentage.toLocaleString('en-US', {
          style: 'percent',
        })}{' '}
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
      <div className='flex-shrink-0 align-self-center'>
        <button className='btn btn-info btn-sm' onClick={sell}>
          Sell This Song
        </button>
      </div>
    </li>
  )
}

const UserProfile = () => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()

  if (!user) {
    return null
  }

  const sellSong = async (song) => {
    console.log('You are selling a song!', JSON.stringify(song.song.id))

    try {
      const updatedUser = await userService.sell(
        song.song.spotifyId,
        song.song.currentPrice,
        user.email
      )
      dispatch(setUser(updatedUser))
    } catch (exception) {
      console.log('that didnt work right')
    }
  }

  // ! Can probably consolidate these somehow.

  const portfolioValue = user.songs.reduce(
    (prev, song) => prev + song.song.currentPrice,
    0
  )

  const portfolioProfit = user.songs.reduce(
    (prev, song) => prev + (song.song.currentPrice - song.purchasePrice),
    0
  )

  const portfolioPercent =
    portfolioProfit /
    user.songs.reduce((prev, song) => prev + song.purchasePrice, 0)

  return (
    <div>
      <h2 className='display-5'>{user.display_name}'s Profile</h2>
      <div>
        Total Net Worth: <strong>{user.netWorth}</strong>
      </div>
      <div>
        You have <strong>{user.points} points</strong> available to spend
      </div>
      <h3>
        Your Portfolio{' '}
        <small className='text-muted'>
          (Worth {portfolioValue} Points - Profit: {portfolioProfit} or{' '}
          {portfolioPercent.toLocaleString('en-US', {
            style: 'percent',
          })}
          )
        </small>
      </h3>
      <ul className='list-group'>
        {user.songs.map((song) => (
          <OwnedSong
            key={song.song.id}
            song={song}
            sell={() => sellSong(song)}
          />
        ))}
      </ul>
    </div>
  )
}

export default UserProfile
