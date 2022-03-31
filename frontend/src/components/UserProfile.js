import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../reducers/userReducer'

const OwnedSong = ({ song }) => {
  const profit = song.currentPrice - song.purchasePrice
  return (
    <li>
      {song.title} by{' '}
      {song.artist.map((artist, i, artists) => {
        if (i !== artists.length - 1) {
          return artist.name + ', '
        } else {
          return artist.name
        }
      })}
      - Current Value: {song.currentPrice} - Purchased at: {song.purchasePrice}{' '}
      - Profit: {profit}
    </li>
  )
}

const UserProfile = () => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()

  if (!user) {
    return null
  }

  const portfolioValue = user.portfolio.reduce(
    (prev, song) => prev + song.currentPrice,
    0
  )

  const logout = () => {
    dispatch(logoutUser())
  }

  return (
    <div>
      <h3>{user.display_name}'s Profile</h3>
      <div>Total Net Worth - {user.points + portfolioValue}</div>
      <div>You have {user.points} points available to spend</div>
      <h4>Your Portfolio - Worth {portfolioValue} Points</h4>
      <ul>
        {user.portfolio.map((song) => (
          <OwnedSong key={song.id} song={song} />
        ))}
      </ul>
      <button onClick={logout}>log out</button>
    </div>
  )
}

export default UserProfile
