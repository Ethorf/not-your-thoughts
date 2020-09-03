import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
// import { setPauseArray, startPauseTimer } from '../../redux/actions/entryActions.js';

function pauseTimer({ timerActive }) {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		let secondsInterval = null;

		if (timerActive) {
			secondsInterval = setInterval(() => {
				setSeconds((seconds) => seconds + 1);
			}, 1000);
		}
		return () => clearInterval(secondsInterval);
	}, [timerActive, seconds]);

	return null;
}

const mapStateToProps = (state) => ({
	timerActive: state.entries.timerActive,
	timeElapsed: state.entries.timeElapsed
});

export default connect(mapStateToProps, {
	setTimeElapsed
})(Timer);
