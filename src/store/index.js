import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import farmReducer from './farmSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    farm: farmReducer,
  },
})

export default store