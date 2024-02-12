import axios from 'axios'
import {
  CHANGE_WORDCOUNT,
  GOAL_REACHED,
  CHANGE_CHARCOUNT,
  SAVE_ENTRY,
  DELETE_ENTRY,
  GET_JOURNAL_ENTRIES,
  ENTRIES_ERROR,
  SET_ENTRY,
  SET_TIME_ELAPSED,
} from './actionTypes'
import setAuthToken from '../../utils/setAuthToken'
import moment from 'moment'
import { loadUser } from './authActions.js'

// Get Entries
export const getJournalEntries = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token)
  }
  try {
    const res = await axios.get('/api/auth')
    dispatch({
      type: GET_JOURNAL_ENTRIES,
      payload: res.data,
    })
  } catch (err) {
    dispatch({
      type: ENTRIES_ERROR,
    })
  }
}

export const changeWordCount = (payload) => (dispatch) => {
  dispatch({
    type: CHANGE_WORDCOUNT,
    payload,
  })
}
export const changeCharCount = (payload) => (dispatch) => {
  dispatch({
    type: CHANGE_CHARCOUNT,
    payload,
  })
}

export const goalReached = () => (dispatch) => {
  dispatch({
    type: GOAL_REACHED,
  })
}

//Entry Actions
export const saveJournalEntry =
  ({ entry, timeElapsed, wpm }) =>
  async (dispatch) => {
    let date = moment().format(`MMMM Do YYYY, h:mm:ss a`)
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const body = { entry, timeElapsed, date, wpm }
    try {
      const res = await axios.post('/api/updateUser', body, config)
      dispatch({
        type: SAVE_ENTRY,
        payload: res.data,
      })
    } catch (err) {
      dispatch({
        type: ENTRIES_ERROR,
      })
    }
  }

export const addJournalEntryAnalysis = (id) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('token'),
    },
  }
  try {
    console.log('entryAnalysis sent')
    await axios.post(`/api/updateUser/entryAnalysis/${id}`, config)
    dispatch(loadUser())
  } catch (err) {
    dispatch({
      type: ENTRIES_ERROR,
    })
  }
}

export const deleteJournalEntry = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`/api/updateUser/${id}`)

    dispatch({
      type: DELETE_ENTRY,
      payload: id,
    })

    dispatch({
      type: GET_JOURNAL_ENTRIES,
      payload: res.data,
    })
  } catch (err) {
    dispatch({
      type: ENTRIES_ERROR,
    })
  }
}

export const setJournalEntry = (payload) => (dispatch) => {
  dispatch({
    type: SET_ENTRY,
    payload,
  })
}

export const setTimeElapsed = (payload) => (dispatch) => {
  dispatch({
    type: SET_TIME_ELAPSED,
    payload,
  })
}
