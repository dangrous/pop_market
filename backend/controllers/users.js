const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')

usersRouter.post('/', async (request, response) => {
  logger.info('hey a new user')

  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    email: body.email,
    points: 1000,
    createDate: new Date(),
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

usersRouter.post('/points', async (request, response) => {
  logger.info(
    'attempting to deduct',
    request.body.amount,
    'points from user:',
    request.body.email
  )

  const body = request.body

  const user = await User.findOne({ email: body.email })

  if (!user) {
    return response.status(401).json({
      error: 'could not find the user',
    })
  }

  user.points = user.points - 1

  user.save()

  response.status(200).send({
    token: body.token,
    email: user.email,
    points: user.points,
    portfolio: user.songs,
    trades: user.trades,
  })
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  response.json(users)
})

module.exports = usersRouter
