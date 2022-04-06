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

export const loginUser = () => {
  return async (dispatch) => {
    const user = await loginService.login()
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
