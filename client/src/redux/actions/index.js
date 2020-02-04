
import { CHANGE_WORDCOUNT } from "./action-types";

//I feel like these should actualy be reducers

export const changeWordCount = (payload) => {
    return {
        type: CHANGE_WORDCOUNT, payload
    }
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

export const saveEntry = (payload) => {
    return {
        type: 'SAVE_ENTRY', payload
    }
};

export const signIn = () => {
    return {
        type: 'SIGNIN'
    }
};

export const signOut = () => {
    return {
        type: 'SIGNOUT'
    }
};