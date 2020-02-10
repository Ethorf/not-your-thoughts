import {
    SAVE_ENTRY,
    DELETE_ENTRY,
    SET_ENTRY,
    GET_ENTRIES,
    ENTRIES_ERROR
  } from '../actions/action-types';
  
  const initialState = {
    token: localStorage.getItem('token'),
    entries:[],
    entry:""
  };
  
  export default function(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case GET_ENTRIES:
        return {
          ...state,
          entries: payload
        };
      case SAVE_ENTRY:
        return {
          ...state,
          entries:[payload,...state.entries]
        };
      case SET_ENTRY:
      return {
        ...state,
        entry:payload
      };
      case ENTRIES_ERROR:
        return {
          ...state,
        };
      default:
        return state;
    }
  }
  