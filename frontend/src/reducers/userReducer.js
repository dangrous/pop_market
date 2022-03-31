import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/login'

const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUser(state, action) {
      return action.payload
    },
    removeUser(state, action) {
      return null
    },
  },
})

export const login = (credentials) => {
  return async (dispatch) => {
    const user = await loginService.login(credentials)
    window.localStorage.setItem('popMarketUser', JSON.stringify(user))
    dispatch(setUser(user))
  }
}

export const trySpotifyUser = () => {
  return async (dispatch) => {
    const user = await loginService.trySpotify()
    if (user) dispatch(setUser(user))
  }
}

export const logoutUser = () => {
  return async (dispatch) => {
    dispatch(removeUser())
    await loginService.logout()
  }
}

export const { setUser, removeUser } = userSlice.actions
export default userSlice.reducer
