import axios from 'axios'
import { useEffect, useState } from 'react'

const App = () => {
  const [users, setUsers] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await axios.get('http://localhost:3001/users')

      setUsers(allUsers.data)
    }

    fetchUsers()
  }, [])

  const submit = async (event) => {
    event.preventDefault()

    console.log(`${username} logged in with password ${password}`)
  }

  return (
    <div>
      <h1>Pop Market</h1>
      <form onSubmit={submit}>
        <div>
          username{' '}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
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
      <ul>
        {users.map((user) => {
          return (
            <li key={user._id}>
              {user.email} / {user.points} / {user.createDate}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default App
