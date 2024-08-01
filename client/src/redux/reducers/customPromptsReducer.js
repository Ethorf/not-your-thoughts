import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'

// Initial state
const initialState = {
  customPrompts: [],
  promptsLoading: false,
  error: null,
}

// Async thunk to fetch custom prompts
export const fetchCustomPrompts = createAsyncThunk('customPrompts/fetchCustomPrompts', async () => {
  try {
    console.log('fetching custom prompts')
    const response = await axiosInstance.get('/api/prompts/custom_prompts')
    return response.data
  } catch (error) {
    throw Error(error.response.data.message)
  }
})

// Async thunk to create a new custom prompt
export const createCustomPrompt = createAsyncThunk('customPrompts/createCustomPrompt', async (newPromptData) => {
  try {
    const response = await axiosInstance.post('/api/prompts/create_custom_prompt', { content: newPromptData })
    return response.data
  } catch (error) {
    throw Error(error.response.data.message)
  }
})

// Async thunk to delete a custom prompt by ID
export const deleteCustomPrompt = createAsyncThunk('customPrompts/deleteCustomPrompt', async (promptId) => {
  try {
    await axiosInstance.delete(`/api/prompts/delete_custom_prompt/${promptId}`)
    return promptId
  } catch (error) {
    throw Error(error.response.data.message)
  }
})

// Async thunk to update a custom prompt's status
export const updatePromptStatus = createAsyncThunk('customPrompts/updatePromptStatus', async ({ promptId, status }) => {
  try {
    const response = await axiosInstance.put(`/api/prompts/update_prompt_status/${promptId}`, { status })
    return response.data
  } catch (error) {
    throw Error(error.response.data.message)
  }
})

// Async thunk to toggle a custom prompt's starred value
export const togglePromptStarred = createAsyncThunk('customPrompts/togglePromptStarred', async (promptId) => {
  try {
    const response = await axiosInstance.put(`/api/prompts/toggle_prompt_starred/${promptId}`)
    return response.data
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
      .addCase(fetchCustomPrompts.pending, (state) => {
        state.promptsLoading = true
      })
      .addCase(fetchCustomPrompts.fulfilled, (state, action) => {
        state.promptsLoading = false
        state.customPrompts = action.payload
      })
      .addCase(fetchCustomPrompts.rejected, (state, action) => {
        state.promptsLoading = false
        state.error = action.error.message
      })
      .addCase(createCustomPrompt.pending, (state) => {
        state.promptsLoading = true
      })
      .addCase(createCustomPrompt.fulfilled, (state, action) => {
        state.promptsLoading = false
        state.customPrompts.unshift(action.payload)
      })
      .addCase(createCustomPrompt.rejected, (state, action) => {
        state.promptsLoading = false
        state.error = action.error.message
      })
      .addCase(deleteCustomPrompt.pending, (state) => {
        state.promptsLoading = true
      })
      .addCase(deleteCustomPrompt.fulfilled, (state, action) => {
        state.promptsLoading = false
        state.customPrompts = state.customPrompts.filter((prompt) => prompt.id !== action.payload)
      })
      .addCase(deleteCustomPrompt.rejected, (state, action) => {
        state.promptsLoading = false
        state.error = action.error.message
      })
      .addCase(updatePromptStatus.pending, (state) => {
        state.promptsLoading = true
      })
      .addCase(updatePromptStatus.fulfilled, (state, action) => {
        state.promptsLoading = false
      })
      .addCase(updatePromptStatus.rejected, (state, action) => {
        state.promptsLoading = false
        state.error = action.error.message
      })
      .addCase(togglePromptStarred.pending, (state) => {
        state.promptsLoading = true
      })
      .addCase(togglePromptStarred.fulfilled, (state, action) => {
        state.promptsLoading = false
      })
      .addCase(togglePromptStarred.rejected, (state, action) => {
        state.promptsLoading = false
        state.error = action.error.message
      })
  },
})

export default customPromptsSlice.reducer
