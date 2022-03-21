import axios from 'axios'
import { useEffect, useState } from 'react'
import loginService from './services/login'
import userService from './services/user'

const App = () => {
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [playlist, setPlaylist] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await axios.get('/api/users')

      setUsers(allUsers.data)
    }

    const fetchPlaylist = async () => {
      const playlist = await axios.get('/api/spotify')

      setPlaylist(playlist)
    }

    fetchUsers()
    fetchPlaylist()
  }, [])

  const buy = async (event) => {
    event.preventDefault()
    try {
      const updatedUser = await userService.deduct(user.token, user.email, 1)
      setUser(updatedUser)
    } catch (exception) {
      console.log('couldnt deduct the point')
    }
  }

  const buySong = async (songId, price) => {
    console.log('You are buying a song!', songId)
    try {
      const updatedUser = await userService.buy(
        user.token,
        songId,
        price,
        user.email
      )
      setUser(updatedUser)
    } catch (exception) {
      console.log('that didnt work right')
    }
  }

  // Repetitive code, also maybe a good use of Redux. i.e. dispatches seem good.
  const sellSong = async (songId, price) => {
    console.log('You are selling a song!', songId)
    try {
      const updatedUser = await userService.sell(
        user.token,
        songId,
        price,
        user.email
      )
      setUser(updatedUser)
    } catch (exception) {
      console.log('that didnt work right')
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        email,
        password,
      })

      window.localStorage.setItem('popMarketUser', JSON.stringify(user))

      setUser(user)
      setEmail('')
      setPassword('')
    } catch (exception) {
      console.log('wrong credentials')
    }
  }

  return (
    <div>
      <h1>Pop Market</h1>
      {!user ? (
        <form onSubmit={submit}>
          <div>
            username{' '}
            <input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
            />
          </div>
          <div>
            password{' '}
            <input
              type='password'
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type='submit'>login</button>
        </form>
      ) : (
        <div>
          {user.email} {user.points} <button onClick={buy}>buy a song</button>
        </div>
      )}
      <ul>
        {users.map((user) => {
          return (
            <li key={user.email}>
              {user.email} / {user.points} / {user.createDate}
            </li>
          )
        })}
      </ul>
      <ul>
        {playlist
          ? playlist.data.tracks.items.map((track, i) => {
              return (
                <li key={track.track.id}>
                  <strong>
                    #{i + 1}: {track.track.name}
                  </strong>{' '}
                  by{' '}
                  <em>
                    {track.track.artists.map((artist, i, artists) => {
                      if (i !== artists.length - 1) {
                        return artist.name + ', '
                      } else {
                        return artist.name
                      }
                    })}
                  </em>
                  {user ? (
                    user.songs.indexOf(track.track.id) === -1 ? (
                      <button onClick={() => buySong(track.track.id, 100 - i)}>
                        BUY This Song for {100 - i} Points!
                      </button>
                    ) : (
                      <button onClick={() => sellSong(track.track.id, 100 - i)}>
                        SELL This Song for {100 - i} Points!
                      </button>
                    )
                  ) : null}
                </li>
              )
            })
          : null}
      </ul>
    </div>
  )
}

export default App
