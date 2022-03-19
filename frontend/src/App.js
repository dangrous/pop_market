import axios from 'axios'
import { useEffect, useState } from 'react'
import loginService from './services/login'
import userService from './services/user'

const App = () => {
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await axios.get('/api/users')

      setUsers(allUsers.data)
    }

    fetchUsers()
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
    </div>
  )
}

export default App
