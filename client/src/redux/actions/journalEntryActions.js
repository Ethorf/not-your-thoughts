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
} from './actionTypes.js'
import setAuthToken from '../../utils/setAuthToken.js'
import moment from 'moment'

// TODO put this in it's own config file for reuse
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token'),
  },
}

// Get Entries
export const getJournalEntries = () => async (dispatch) => {
  try {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token')

    // If token exists, set it in the axios headers
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token
    } else {
      delete axios.defaults.headers.common['x-auth-token']
    }

    // Make the request
    const res = await axios.get('/api/entries/journal_entries')

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

// Word / Char count
// TODO move this out into a  word count actions file since there's already a reducer

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
  ({ entry, timeElapsed, wpm, wordCount }) =>
  async (dispatch) => {
    let date = moment().format(`MMMM Do YYYY, h:mm:ss a`)

    // TODO update with real values once we fix timer & wpm
    const body = { content: entry, total_time_taken: timeElapsed, wpm: 60, num_of_words: wordCount }

    try {
      const res = await axios.post('/api/entries/add_journal_entry', body, axiosConfig)

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
  try {
    await axios.post(`/api/updateUser/entryAnalysis/${id}`, axiosConfig)
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
