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
      <h3>
        Leaderboard
        <small className='text-muted'> (Top Ten Users by Net Worth)</small>
      </h3>
      <ol className='list-group list-group-numbered'>
        {users.map((user) => {
          return (
            <li className='list-group-item' key={user.email}>
              {user.netWorth} - {user.email}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default Leaderboard
