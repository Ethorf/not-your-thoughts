import axiosInstance from '@utils/axiosInstance'
import { setAlert } from './alert'
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  INCREASE_DAYS,
  DAY_INCREASE_ERROR,
  SET_FIRST_LOGIN,
  ADD_CUSTOM_PROMPT,
  DELETE_CUSTOM_PROMPT,
  ADD_TRACKED_PHRASE,
  DELETE_TRACKED_PHRASE,
  CUSTOM_PROMPT_ERROR,
  TOGGLE_CUSTOM_PROMPTS_ENABLED,
  TOGGLE_GUEST_MODE,
} from './actionTypes'

import setAuthToken from '../../utils/setAuthToken'

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
}

// Register User
export const register =
  ({ name, email, password }) =>
  async (dispatch) => {
    const body = JSON.stringify({ name, email, password })
    try {
      const res = await axiosInstance.post('/api/auth/register', body, axiosConfig)

      await dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      })
    } catch (err) {
      const errors = err.response.data.errors

      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')))
      }
      dispatch({
        type: REGISTER_FAIL,
      })
    }
  }

// Login User
export const login = (email, password) => async (dispatch) => {
  const body = JSON.stringify({ email, password })

  try {
    const res = await axiosInstance.post('/api/auth/login', body, axiosConfig)
    // This is the reducer where the localStorage token is set
    await dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    })
    return res.data
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
    })
    return err
  }
}

// Load User
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token)
  }

  try {
    const res = await axiosInstance.get('/api/auth/user', axiosConfig)

    await dispatch({
      type: USER_LOADED,
      payload: res.data,
    })
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    })
  }
}

// Toggle Guest Mode
export const toggleGuestMode = () => (dispatch) => {
  dispatch({ type: TOGGLE_GUEST_MODE })
}

// Logout / Clear Profile
export const logout = () => (dispatch) => {
  dispatch({ type: LOGOUT })
}

export const increaseDays = () => async (dispatch) => {
  try {
    const res = await axiosInstance.post('/api/increaseDays', axiosConfig)
    dispatch({
      type: INCREASE_DAYS,
      payload: res.data,
    })
  } catch (err) {
    const errors = err.response.data.errors
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')))
    }
    dispatch({
      type: DAY_INCREASE_ERROR,
    })
  }
}

export const setFirstLogin = () => async (dispatch) => {
  try {
    const res = await axiosInstance.post('/api/setFirstLogin', axiosConfig)
    dispatch({
      type: SET_FIRST_LOGIN,
      payload: res.data,
    })
  } catch (err) {
    const errors = err.response.data.errors
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')))
    }
  }
}

//Prompt Actions -- Maybe try to move this to somewhere else as this file is getting a little bloated

export const addCustomPrompt =
  ({ prompt }) =>
  async (dispatch) => {
    const body = JSON.stringify({ prompt })
    try {
      const res = await axiosInstance.post('/api/updateUser/prompts', body, axiosConfig)
      dispatch({
        type: ADD_CUSTOM_PROMPT,
        payload: res.data,
      })
    } catch (err) {
      dispatch({
        type: CUSTOM_PROMPT_ERROR,
      })
    }
  }

export const deleteCustomPrompt = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.delete(`/api/updateUser/prompts/${id}`)
    dispatch({
      type: DELETE_CUSTOM_PROMPT,
      payload: id,
    })
  } catch (err) {
    dispatch({
      type: CUSTOM_PROMPT_ERROR,
    })
  }
}

export const toggleCustomPromptsEnabled = () => async (dispatch) => {
  const config = {
    headers: {
      'x-auth-token': localStorage.getItem('token'),
    },
  }
  try {
    const res = await axiosInstance.post('/api/updateUser/toggleCustomPrompts', config)
    dispatch({
      type: TOGGLE_CUSTOM_PROMPTS_ENABLED,
    })
  } catch (err) {
    console.log('toggle prompts error')
  }
}

//Tracked Phrases

export const addTrackedPhrase =
  ({ phrase }) =>
  async (dispatch) => {
    const body = JSON.stringify({ phrase })
    try {
      const res = await axiosInstance.post('/api/updateUser/phrases/', body, axiosConfig)
      dispatch({
        type: ADD_TRACKED_PHRASE,
        payload: res.data,
      })
      console.log('phrase submitted')
    } catch (err) {
      dispatch({
        type: CUSTOM_PROMPT_ERROR,
      })
    }
  }

export const deleteTrackedPhrase = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/api/updateUser/phrases/${id}`)
    dispatch({
      type: DELETE_TRACKED_PHRASE,
      payload: id,
    })
  } catch (err) {
    dispatch({
      type: CUSTOM_PROMPT_ERROR,
    })
  }
}
