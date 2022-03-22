import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import App from './App'

import songReducer from './reducers/songReducer'
import userReducer from './reducers/userReducer'

const store = configureStore({
  reducer: {
    songs: songReducer,
    user: userReducer,
  },
})

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
