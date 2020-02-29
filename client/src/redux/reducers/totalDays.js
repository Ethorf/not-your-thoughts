
const totalDaysReducer = (state, action) => {
    switch(action.type) {
        case 'INCREASETOTALDAYS':
            return state + 1;
        default:
            return state;
    }
}

export default totalDaysReducer;
