import { useEffect } from 'react'
import { initializeSongs } from './reducers/songReducer'
import { trySpotifyUser } from './reducers/userReducer'
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
    dispatch(trySpotifyUser())
  }, [dispatch])

  return (
    <>
      <h1 className='display-5 bg-dark text-white p-2 border-bottom border-white'>
        Pop Market
      </h1>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col'>
            {!user ? <LoginForm /> : <UserProfile />}
            <Leaderboard />
          </div>
          <div className='col-5'>
            <SongList />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
