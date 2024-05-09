import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

import { showToast } from '@utils/toast'

const initialState = {
  category: '',
  allCategories: [],
  currentCategory: null,
}

export const fetchCategories = createAsyncThunk('categoriesReducer/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('api/categories')
    return response.data.categories
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

const categoriesSlice = createSlice({
  name: 'categoriesReducer',
  initialState,
  reducers: {
    setCurrentCategory: (state, action) => {
      state.category = action.payload
    },
    setAllCategories: (state, action) => {
      state.allCategories = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.allCategories = action.payload
    })
  },
})

export const { setCurrentCategory } = categoriesSlice.actions

export default categoriesSlice.reducer
