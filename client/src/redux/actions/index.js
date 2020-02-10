
import { CHANGE_WORDCOUNT,GOAL_REACHED } from "./action-types";

//I feel like these should actualy be reducers

export const changeWordCount = (payload)=> dispatch => {
    dispatch({
        type: CHANGE_WORDCOUNT, payload
    })
};

export const goalReached = ()=> dispatch => {
    dispatch({
        type: GOAL_REACHED
    })
};

export const increaseTotalDays = () => {
    return {
        type: 'INCREASETOTALDAYS'
    }
};

export const increaseConsecutiveDays = () => {
    return {
        type: 'INCREASECONSECUTIVEDAYS'
    }
};
