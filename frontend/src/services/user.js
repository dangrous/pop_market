import axios from 'axios'

const createUser = async (email, password) => {
  const toSend = {
    email,
    password,
  }
  await axios.post('/api/users/', toSend)

  const response = await axios.post('/api/login', toSend)

  return response.data
}

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

const userService = { buy, sell, createUser }
export default userService
