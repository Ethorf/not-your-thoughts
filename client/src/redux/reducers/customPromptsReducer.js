import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Initial state
const initialState = {
  customPrompts: [],
  loading: false,
  error: null,
}

// Async thunk to fetch custom prompts
export const fetchCustomPrompts = createAsyncThunk('customPrompts/fetchCustomPrompts', async () => {
  try {
    const response = await axios.get('/api/prompts/custom_prompts')
    return response.data
  } catch (error) {
    throw Error(error.response.data.message)
  }
})

// Async thunk to create a new custom prompt
export const createCustomPrompt = createAsyncThunk('customPrompts/createCustomPrompt', async (newPromptData) => {
  try {
    const response = await axios.post('/api/prompts/create_custom_prompt', { content: newPromptData })
    return response.data
  } catch (error) {
    throw Error(error.response.data.message)
  }
})

// Async thunk to delete a custom prompt by ID
export const deleteCustomPrompt = createAsyncThunk('customPrompts/deleteCustomPrompt', async (promptId) => {
  try {
    await axios.delete(`/api/prompts/delete_custom_prompt/${promptId}`)
    return promptId
  } catch (error) {
    throw Error(error.response.data.message)
  }
})

// Custom prompts slice
const customPromptsSlice = createSlice({
  name: 'customPrompts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch custom prompts reducers
      .addCase(fetchCustomPrompts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCustomPrompts.fulfilled, (state, action) => {
        state.loading = false
        state.customPrompts = action.payload
      })
      .addCase(fetchCustomPrompts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Create custom prompt reducers
      .addCase(createCustomPrompt.pending, (state) => {
        state.loading = true
      })
      .addCase(createCustomPrompt.fulfilled, (state, action) => {
        state.loading = false
        state.customPrompts.unshift(action.payload)
      })
      .addCase(createCustomPrompt.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Delete custom prompt reducers
      .addCase(deleteCustomPrompt.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteCustomPrompt.fulfilled, (state, action) => {
        state.loading = false
        state.customPrompts = state.customPrompts.filter((prompt) => prompt.id !== action.payload)
      })
      .addCase(deleteCustomPrompt.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default customPromptsSlice.reducer