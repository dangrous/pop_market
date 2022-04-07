import { useEffect } from 'react'
import { initializeSongs } from './reducers/songReducer'
import { loginUser, logoutUser } from './reducers/userReducer'
import { useDispatch, useSelector } from 'react-redux'
import SongList from './components/SongList'
import Leaderboard from './components/Leaderboard'
import UserProfile from './components/UserProfile'

const App = () => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeSongs())
    dispatch(loginUser())
  }, [dispatch])

  const oauthRequestUrl = '/api/users/login'

  const logout = () => {
    dispatch(logoutUser())
  }

  return (
    <>
      <div className='d-flex justify-content-between bg-dark text-white'>
        <h1 className='display-5 p-2'>Pop Market</h1>
        <div className='d-flex align-items-center'>
          {user ? (
            <button className='m-2 btn btn-sm btn-primary' onClick={logout}>
              Log Out
            </button>
          ) : (
            <a href={oauthRequestUrl} className='m-2 btn btn-primary btn-sm'>
              Login with Spotify
            </a>
          )}
        </div>
      </div>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col'>
            <Leaderboard />
            {user ? <UserProfile /> : null}
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
