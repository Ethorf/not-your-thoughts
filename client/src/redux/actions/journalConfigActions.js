import axios from 'axios'
import {
  TOGGLE_TIMER_ACTIVE,
  CHANGE_GOAL,
  ENTRIES_ERROR,
  TOGGLE_PROGRESS_AUDIO,
  TOGGLE_EDIT_GOAL,
  SET_NEW_GOAL_ERROR,
  SET_NEW_GOAL,
  SET_JOURNAL_CONFIG,
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
    console.log(res)

    dispatch({
      type: SET_JOURNAL_CONFIG,
      payload: res.data,
    })
  } catch (err) {
    dispatch({
      type: ENTRIES_ERROR,
    })
  }
}

//all of the settings have to be capitalized for the backend shit
export const toggleJournalConfigSetting = (setting, bool) => async (dispatch) => {
  let body
  console.log('setting is:')
  console.log(setting)
  console.log('bool is:')
  console.log(bool)
  switch (setting) {
    case 'Audio':
      body = { progress_audio_enabled: bool }
      break
    case 'Timer':
      body = { timer_enabled: bool }
      break
    case 'Wpm':
      body = { wpm_enabled: bool }
      break
    default:
      return null
  }

  try {
    const res = await axios.post(`/api/journal_config/update_toggles`, body, axiosConfig)
    dispatch({
      //still gotta change this to be somethin else? okay so right now these literally do absolutely nothing
      type: TOGGLE_PROGRESS_AUDIO,
      payload: res.data,
    })
  } catch (err) {
    console.log('toggle error')
  }
}

// Change Journalling Goal
export const updateJournalGoal = (payload) => async (dispatch) => {
  const body = payload

  try {
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
