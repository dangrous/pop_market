import axios from 'axios'
const baseUrl = '/api/spotify'

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const songService = { getAll }
export default songService
