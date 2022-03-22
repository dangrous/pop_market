import { useEffect } from 'react'
import { initializeSongs } from './reducers/songReducer'
import { useDispatch, useSelector } from 'react-redux'
import SongList from './components/SongList'
import Leaderboard from './components/Leaderboard'
import UserProfile from './components/UserProfile'
import LoginForm from './components/LoginForm'

const App = () => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeSongs())
  }, [dispatch])

  return (
    <div>
      <h1>Pop Market</h1>
      {!user ? <LoginForm /> : <UserProfile />}
      <Leaderboard />
      <SongList />
    </div>
  )
}

export default App
