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

const userService = { deduct }
export default userService
