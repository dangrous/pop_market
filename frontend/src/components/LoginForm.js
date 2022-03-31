import { useState } from 'react'
import { useDispatch } from 'react-redux'
import userService from '../services/user'
import { login } from '../reducers/userReducer'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()

  const createUser = async () => {
    try {
      const user = await userService.createUser(email, password)

      window.localStorage.setItem('popMarketUser', JSON.stringify(user))

      setEmail('')
      setPassword('')
    } catch (exception) {
      console.log('sorry, something went wrong')
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      dispatch(
        login({
          email,
          password,
        })
      )
      setEmail('')
      setPassword('')
    } catch (exception) {
      console.log('wrong credentials')
    }
  }

  // ! This will not work in production, will need to adjust to relative but for
  // ! some reason I can't get it to work in dev otherwise.
  const oauthRequestUrl = 'http://localhost:3001/api/login/oauth'

  return (
    <div>
      <h3>Login or create an account</h3>
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
        OR
        <button onClick={createUser}>create new user</button>
        OR <a href={oauthRequestUrl}>Login with Spotify</a>
      </form>
    </div>
  )
}

export default LoginForm
