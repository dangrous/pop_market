import { useState, useEffect } from 'react'
import axios from 'axios'

const Leaderboard = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await axios.get('/api/users')

      setUsers(allUsers.data.slice(0, 10))
    }

    fetchUsers()
  }, [])

  return (
    <div>
      <h3>Leaderboard (Top Ten Users)</h3>
      <ul>
        {users.map((user) => {
          return (
            <li key={user.email}>
              {user.email} / {user.netWorth} / {user.createDate}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Leaderboard
