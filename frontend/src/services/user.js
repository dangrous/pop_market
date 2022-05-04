import axios from 'axios'

const buy = async (songId, price, email) => {
  const toSend = {
    songId,
    price,
    email,
  }
  const response = await axios.post('/api/trade/buy', toSend)
  return response.data
}

const sell = async (songId, price, email) => {
  const toSend = {
    songId,
    price,
    email,
  }
  const response = await axios.post('/api/trade/sell', toSend)
  return response.data
}

const getProfile = async (email) => {
  const response = await axios.get('/api/users/profile/' + email)
  return response.data
}

const userService = { buy, sell, getProfile }
export default userService
