import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../reducers/userReducer'

const OwnedSong = ({ song }) => {
  const profit = song.song.currentPrice - song.purchasePrice

  const percentage =
    (song.song.currentPrice - song.purchasePrice) / song.purchasePrice

  return (
    <li>
      {song.song.title} by{' '}
      {song.song.artist.map((artist, i, artists) => {
        if (i !== artists.length - 1) {
          return artist.name + ', '
        } else {
          return artist.name
        }
      })}
      - Current Value: {song.song.currentPrice} - Purchased at:{' '}
      {song.purchasePrice} - Profit: {profit} or{' '}
      {percentage.toLocaleString('en-US', {
        style: 'percent',
      })}
    </li>
  )
}

const UserProfile = () => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()

  if (!user) {
    return null
  }

  console.log(JSON.stringify(user))

  const portfolioValue = user.songs.reduce(
    (prev, song) => prev + song.song.currentPrice,
    0
  )

  const logout = () => {
    dispatch(logoutUser())
  }

  return (
    <div>
      <h3>{user.display_name}'s Profile</h3>
      <div>Total Net Worth - {user.netWorth}</div>
      <div>You have {user.points} points available to spend</div>
      <h4>Your Portfolio - Worth {portfolioValue} Points</h4>
      <ul>
        {user.songs.map((song) => (
          <OwnedSong key={song.id} song={song} />
        ))}
      </ul>
      <button onClick={logout}>log out</button>
    </div>
  )
}

export default UserProfile
