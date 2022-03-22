import { useSelector } from 'react-redux'

const UserProfile = () => {
  const user = useSelector((state) => state.user)

  if (!user) {
    return null
  }

  return (
    <div>
      <h3>{user.email}'s Profile</h3>
      <div>You have {user.points} points available</div>
      <h4>Your Portfolio</h4>
      <ul>
        {user.songs.map((song) => (
          <li key={song}>{JSON.stringify(song)}</li>
        ))}
      </ul>
    </div>
  )
}

export default UserProfile
