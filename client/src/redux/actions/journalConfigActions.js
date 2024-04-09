import axios from 'axios'
import {
  TOGGLE_TIMER_ACTIVE,
  CHANGE_GOAL,
  ENTRIES_ERROR,
  TOGGLE_EDIT_GOAL,
  SET_NEW_GOAL_ERROR,
  SET_NEW_GOAL,
  SET_JOURNAL_CONFIG,
  UPDATE_JOURNAL_CONFIG,
} from './actionTypes'
import setAuthToken from '../../utils/setAuthToken'

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token'),
  },
}

// Get Journal Config
export const getJournalConfig = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token)
  }
  try {
    const res = await axios.get('/api/journal_config')

    dispatch({
      type: SET_JOURNAL_CONFIG,
      payload: res.data.journalConfig,
    })
  } catch (err) {
    dispatch({
      type: ENTRIES_ERROR,
    })
  }
}

//all of the settings have to be capitalized for the backend shit
export const toggleJournalConfigSetting = (setting, bool) => async (dispatch) => {
  let body = { [setting]: bool }

  try {
    // ** Doing it this way makes the state update on the front end slightly slower but feels like then we're seeing the actual data as opposed to just state?
    // ** Maybe see if we can improve that?

    const res = await axios.post(`/api/journal_config/update_toggles`, body, axiosConfig)
    let newConfig = res.data.newJournalConfigToggles.rows[0]
    dispatch({
      type: UPDATE_JOURNAL_CONFIG,
      payload: newConfig,
    })
  } catch (err) {
    console.log('toggle error')
  }
}

// Change Journalling Goal
export const updateJournalGoal = (payload) => async (dispatch) => {
  const body = payload

  try {
    console.log('update journal goal hit')
    const res = await axios.post(`/api/journal_config/update_goals`, body, axiosConfig)

    dispatch({
      type: CHANGE_GOAL,
      payload,
    })
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
