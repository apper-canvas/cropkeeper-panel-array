import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import farmService from '../services/api/farmService'

// Async thunk for loading farms
export const loadFarms = createAsyncThunk(
  'farm/loadFarms',
  async (_, { rejectWithValue }) => {
    try {
      const farms = await farmService.getAll()
      return farms
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load farms')
    }
  }
)

const initialState = {
  farms: [],
  selectedFarm: null,
  loading: false,
  error: null,
  isInitialized: false
}

// Load selected farm from localStorage
const loadSelectedFarmFromStorage = () => {
  try {
    const savedFarmId = localStorage.getItem('selectedFarmId')
    return savedFarmId ? savedFarmId : null
  } catch (error) {
    console.warn('Failed to load selected farm from localStorage:', error)
    return null
  }
}

// Save selected farm to localStorage
const saveSelectedFarmToStorage = (farmId) => {
  try {
    if (farmId) {
      localStorage.setItem('selectedFarmId', farmId)
    } else {
      localStorage.removeItem('selectedFarmId')
    }
  } catch (error) {
    console.warn('Failed to save selected farm to localStorage:', error)
  }
}

export const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    setSelectedFarm: (state, action) => {
      state.selectedFarm = action.payload
      saveSelectedFarmToStorage(action.payload?.id)
    },
    clearFarmState: (state) => {
      state.farms = []
      state.selectedFarm = null
      state.loading = false
      state.error = null
      state.isInitialized = false
      localStorage.removeItem('selectedFarmId')
    },
    initializeFarmSelection: (state) => {
      if (state.farms.length > 0 && !state.selectedFarm) {
        const savedFarmId = loadSelectedFarmFromStorage()
        if (savedFarmId) {
          const savedFarm = state.farms.find(farm => farm.id === savedFarmId)
          if (savedFarm) {
            state.selectedFarm = savedFarm
          } else {
            // Saved farm not found, select first available
            state.selectedFarm = state.farms[0]
            saveSelectedFarmToStorage(state.farms[0].id)
          }
        } else {
          // No saved farm, select first available
          state.selectedFarm = state.farms[0]
          saveSelectedFarmToStorage(state.farms[0].id)
        }
      }
      state.isInitialized = true
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFarms.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadFarms.fulfilled, (state, action) => {
        state.loading = false
        state.farms = action.payload
        state.error = null
        
        // Auto-select farm after loading
        if (action.payload.length > 0 && !state.selectedFarm) {
          const savedFarmId = loadSelectedFarmFromStorage()
          if (savedFarmId) {
            const savedFarm = action.payload.find(farm => farm.id === savedFarmId)
            if (savedFarm) {
              state.selectedFarm = savedFarm
            } else {
              state.selectedFarm = action.payload[0]
              saveSelectedFarmToStorage(action.payload[0].id)
            }
          } else {
            state.selectedFarm = action.payload[0]
            saveSelectedFarmToStorage(action.payload[0].id)
          }
        }
        state.isInitialized = true
      })
      .addCase(loadFarms.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isInitialized = true
      })
  },
})

export const { setSelectedFarm, clearFarmState, initializeFarmSelection } = farmSlice.actions
export default farmSlice.reducer