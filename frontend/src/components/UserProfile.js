import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../reducers/userReducer'
import userService from '../services/user'

const OwnedSong = ({ song, sell }) => {
  const profit = song.song.currentPrice - song.purchasePrice

  const percentage =
    (song.song.currentPrice - song.purchasePrice) / song.purchasePrice

  let background = ''

  if (profit > 0) {
    background = ' bg-success'
  }

  if (profit < 0) {
    background = ' bg-danger'
  }

  return (
    <li className={'list-group-item d-flex' + background}>
      <div className='flex-grow-1'>
        <strong>{song.song.title}</strong>
        <br />
        <em>
          {song.song.artist.map((artist, i, artists) => {
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

  const portfolioValue = user.songs.reduce(
    (prev, song) => prev + song.song.currentPrice,
    0
  )

  return (
    <div>
      <h2>{user.display_name}'s Profile</h2>
      <div>Total Net Worth - {user.netWorth}</div>
      <div>You have {user.points} points available to spend</div>
      <h3>
        Your Portfolio
        <small className='text-muted'> Worth {portfolioValue} Points</small>
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
