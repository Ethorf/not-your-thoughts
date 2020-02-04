const wordCountReducer = (state, action) => {
    switch(action.type) {
        case 'INCREASEWORDCOUNT':
            return state + 1;
        case 'DECREASEWORDCOUNT':
            return state - 1;

        default:
            return state;
    }
}

export default wordCountReducer;
