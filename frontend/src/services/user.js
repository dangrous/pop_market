import axios from 'axios'
const baseUrl = '/api/users/points'

const deduct = async (token, email, amount) => {
  console.log('got to the user service')
  const toSend = {
    token,
    email,
    amount,
  }
  const response = await axios.post(baseUrl, toSend)
  return response.data
}

const createUser = async (email, password) => {
  const toSend = {
    email,
    password,
  }
  await axios.post('/api/users/', toSend)

  const response = await axios.post('/api/login', toSend)

  return response.data
}

const buy = async (token, songId, price, email) => {
  const toSend = {
    token,
    songId,
    price,
    email,
  }
  const response = await axios.post('/api/trade/buy', toSend)
  return response.data
}

const sell = async (token, songId, price, email) => {
  const toSend = {
    token,
    songId,
    price,
    email,
  }
  const response = await axios.post('/api/trade/sell', toSend)
  return response.data
}

const userService = { deduct, buy, sell, createUser }
export default userService
