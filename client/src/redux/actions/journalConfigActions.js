import axios from 'axios'
import {
  TOGGLE_TIMER_ACTIVE,
  CHANGE_GOAL,
  ENTRIES_ERROR,
  TOGGLE_EDIT_GOAL,
  SET_NEW_GOAL_ERROR,
  SET_NEW_GOAL,
  GET_JOURNAL_CONFIG,
} from './actionTypes'
import setAuthToken from '../../utils/setAuthToken'
import { loadUser } from './authActions.js'

// Get Journal Config
export const getJournalConfig = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token)
  }
  try {
    const res = await axios.get('/api/auth')
    dispatch({
      type: GET_JOURNAL_CONFIG,
      payload: res.data,
    })
  } catch (err) {
    dispatch({
      type: ENTRIES_ERROR,
    })
  }
}

// Change Journalling Goal
export const changeJournalGoal = (payload, type) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('token'),
    },
  }
  const body = { goal: payload }
  try {
    const res = await axios.post(`/api/updateUser/setNew${type}Goal`, body, config)

    dispatch({
      type: CHANGE_GOAL,
      payload,
    })

    dispatch(loadUser())
  } catch (err) {
    dispatch({
      type: SET_NEW_GOAL_ERROR,
    })
  }
}

export const toggleEditGoal = (payload) => (dispatch) => {
  dispatch({
    type: TOGGLE_EDIT_GOAL,
    payload,
  })
}

export const toggleTimerActive = (payload) => (dispatch) => {
  dispatch({
    type: TOGGLE_TIMER_ACTIVE,
    payload,
  })
}

export const setNewGoal = (payload) => (dispatch) => {
  dispatch({
    type: SET_NEW_GOAL,
    payload,
  })
}
