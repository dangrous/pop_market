require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URI = process.env.MONGODB_URI

const SECRET = process.env.SECRET

const CLIENT_ID = process.env.CLIENT_ID

const CLIENT_SECRET = process.env.CLIENT_SECRET

const NODE_ENV = process.env.NODE_ENV

module.exports = {
  PORT,
  MONGODB_URI,
  SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  NODE_ENV,
}
