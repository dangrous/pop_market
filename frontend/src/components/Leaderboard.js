import { useState, useEffect } from 'react'
import axios from 'axios'
import userService from '../services/user'

const UserProfile = (user) => {
  if (!user) {
    return null
  }

  // ! Can probably consolidate these somehow.

  const portfolioValue = user.user.songs.reduce(
    (prev, song) => prev + song.song.currentPrice,
    0
  )

  const portfolioProfit = user.user.songs.reduce(
    (prev, song) => prev + (song.song.currentPrice - song.purchasePrice),
    0
  )

  const portfolioPercent =
    portfolioProfit /
    user.user.songs.reduce((prev, song) => prev + song.purchasePrice, 0)

  return (
    <div>
      <h2 className='display-5'>{user.user.display_name}'s Profile</h2>
      <div>
        Total Net Worth: <strong>{user.user.netWorth}</strong>
      </div>
      <div>
        You have <strong>{user.user.points} points</strong> available to spend
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
        {user.user.songs.map((song) => (
          <OwnedSong key={song.song.id} song={song} />
        ))}
      </ul>
    </div>
  )
}

const OwnedSong = ({ song }) => {
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
    </li>
  )
}

const Leaderboard = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await axios.get('/api/users')

      setUsers(allUsers.data.slice(0, 10))
    }

    fetchUsers()
  }, [])

  const getUserProfile = async (email) => {
    const profile = await userService.getProfile(email)

    setSelectedUser(profile)
  }

  return (
    <div>
      <h2>
        Leaderboard
        <small className='text-muted'> (Top Ten Users by Net Worth)</small>
      </h2>
      <ol className='list-group list-group-numbered'>
        {users.map((user) => {
          return (
            <li className='list-group-item' key={user.email}>
              {user.netWorth} - {user.display_name}{' '}
              <button
                className='btn btn-primary btn-sm mt-2'
                onClick={() => {
                  getUserProfile(user.email)
                }}
              >
                View Profile
              </button>
            </li>
          )
        })}
      </ol>
      {selectedUser ? <UserProfile user={selectedUser} /> : null}
    </div>
  )
}

export default Leaderboard
