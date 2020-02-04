import {
    SET_CURRENT_USER,
    USER_LOADING
  } from "../constants/action-types";


  // these reducers seem to be utilizing a different inital state in every one of them, 
  //perhaps this is just to separate concerns and to always have the initial state as a thing, 
  // then once that is authd it will return the state and append the current user object to the store state value??

  
  const isEmpty = require("is-empty");
  const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false
  };

  export default function(state = initialState, action) {
    switch (action.type) {
      case SET_CURRENT_USER:
        return {
          ...state,
          isAuthenticated: !isEmpty(action.payload),
          user: action.payload
        };
      case USER_LOADING:
        return {
          ...state,
          loading: true
        };
      default:
        return state;
    }
  }