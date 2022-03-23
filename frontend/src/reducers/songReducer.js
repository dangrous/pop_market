import { createSlice } from '@reduxjs/toolkit'
import songService from '../services/song'

const songSlice = createSlice({
  name: 'songs',
  initialState: [],
  reducers: {
    setSongs(state, action) {
      return action.payload
    },
  },
})

export const initializeSongs = () => {
  return async (dispatch) => {
    const songs = await songService.getAll()
    dispatch(setSongs(songs.tracks.items))
  }
}

export const { setSongs } = songSlice.actions
export default songSlice.reducer
