import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../reducers/userReducer'
import { setUser } from '../reducers/userReducer'
import userService from '../services/user'

const OwnedSong = ({ song, sell }) => {
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
      })}{' '}
      <button onClick={sell}>Sell This Song</button>
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
        user.token,
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
      <h3>{user.display_name}'s Profile</h3>
      <div>Total Net Worth - {user.netWorth}</div>
      <div>You have {user.points} points available to spend</div>
      <h4>Your Portfolio - Worth {portfolioValue} Points</h4>
      <ul>
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
