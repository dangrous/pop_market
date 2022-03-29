import { useSelector } from 'react-redux'

const OwnedSong = ({ song }) => {
  const profit = song.currentPrice - song.purchasePrice
  return (
    <li key={song.id}>
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

  if (!user) {
    return null
  }

  const portfolioValue = user.portfolio.reduce(
    (prev, song) => prev + song.currentPrice,
    0
  )

  return (
    <div>
      <h3>{user.email}'s Profile</h3>
      <div>Total Net Worth - {user.points + portfolioValue}</div>
      <div>You have {user.points} points available to spend</div>
      <h4>Your Portfolio - Worth {portfolioValue} Points</h4>
      <ul>
        {user.portfolio.map((song) => (
          <OwnedSong song={song} />
        ))}
      </ul>
    </div>
  )
}

export default UserProfile
