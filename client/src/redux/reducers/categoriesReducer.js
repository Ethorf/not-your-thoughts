import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'

import { showToast } from '@utils/toast'

const initialState = {
  category: '',
  allCategories: [],
  currentCategory: null,
  loading: false,
}

export const fetchCategories = createAsyncThunk('categoriesReducer/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('api/categories')
    return response.data.categories
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

export const updateParentCategory = createAsyncThunk(
  'categoriesReducer/updateParentCategory',
  async ({ childCategoryId, parentCategoryId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`api/categories/parent_category/${childCategoryId}`, {
        parent_category_id: parentCategoryId,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const updateChildCategories = createAsyncThunk(
  'categoriesReducer/updateChildCategories',
  async ({ parentCategoryId, childCategoryId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`api/categories/child_categories/${parentCategoryId}`, {
        child_category_id: childCategoryId,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createCategory = createAsyncThunk(
  'categoriesReducer/createCategory',
  async (name, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('api/categories/create_category', { name })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const categoriesSlice = createSlice({
  name: 'categoriesReducer',
  initialState,
  reducers: {
    setCurrentCategory: (state, action) => {
      // if (action?.payload?.id) {
      const categoryId = action?.payload?.id
      const foundCategory = state.allCategories.find((category) => category.id === categoryId)
      state.currentCategory = foundCategory || null
      // } else {
      //   state.currentCategory = null
      // }
    },
    setAllCategories: (state, action) => {
      state.allCategories = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state, action) => {
        state.loading = true
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.allCategories = action.payload
        state.loading = false
      })
      .addCase(updateChildCategories.fulfilled, (state, action) => {
        state.allCategories = action.payload.categories
      })
      .addCase(updateParentCategory.fulfilled, (state, action) => {
        state.allCategories = action.payload.categories
      })
  },
})

export const { setCurrentCategory } = categoriesSlice.actions

export default categoriesSlice.reducer
