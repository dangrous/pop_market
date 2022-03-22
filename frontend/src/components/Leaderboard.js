import { useState, useEffect } from 'react'
import axios from 'axios'

const Leaderboard = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await axios.get('/api/users')

      setUsers(allUsers.data)
    }

    fetchUsers()
  }, [])

  return (
    <div>
      <h3>Leaderboard</h3>
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

export default Leaderboard
