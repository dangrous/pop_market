import { useState } from 'react'
import { useDispatch } from 'react-redux'
import loginService from '../services/login'
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
      </form>
    </div>
  )
}

export default LoginForm
