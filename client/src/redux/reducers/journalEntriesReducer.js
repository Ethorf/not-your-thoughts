import {
  SAVE_ENTRY,
  DELETE_ENTRY,
  SET_ENTRY,
  GET_JOURNAL_ENTRIES,
  SET_JOURNAL_CONFIG,
  ENTRIES_ERROR,
  SET_TIME_ELAPSED,
  TOGGLE_TIMER_ACTIVE,
} from '../actions/actionTypes'

const initialState = {
  journalConfig: null,
  entries: [],
  entry: '',
  timeElapsed: '',
  loading: true,
  timerActive: false,
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case GET_JOURNAL_ENTRIES:
      return {
        ...state,
        entries: payload.entries,
        loading: false,
      }
    case SET_JOURNAL_CONFIG:
      return {
        ...state,
        journalConfig: payload.journalConfig,
        loading: false,
      }
    case SAVE_ENTRY:
      return {
        ...state,
        entries: [payload, ...state.entries],
      }
    case DELETE_ENTRY:
      return {
        ...state,
        loading: true,
        entries: state.entries.filter((entry) => entry.id !== payload),
      }
    case SET_ENTRY:
      return {
        ...state,
        entry: payload,
      }
    case SET_TIME_ELAPSED:
      return {
        ...state,
        timeElapsed: payload,
      }
    case TOGGLE_TIMER_ACTIVE:
      return {
        ...state,
        timerActive: payload,
      }
    case ENTRIES_ERROR:
      return {
        ...state,
      }
    default:
      return state
  }
}
