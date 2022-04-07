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

const userService = { buy, sell }
export default userService
