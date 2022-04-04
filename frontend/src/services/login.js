import axios from 'axios'
const baseUrl = '/api/login'

const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

const logout = async () => {
  const response = await axios.post(baseUrl + '/logout')
  return response.data
}

const trySpotify = async () => {
  const response = await axios.post(baseUrl + '/tryspotify')
  return response.data
}

const loginService = { login, trySpotify, logout }
export default loginService
