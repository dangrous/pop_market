import axios from 'axios'
const baseUrl = '/api/users'

const logout = async () => {
  const response = await axios.post(baseUrl + '/logout')
  return response.data
}

const login = async () => {
  const response = await axios.post(baseUrl + '/login')
  return response.data
}

const loginService = { login, logout }
export default loginService
