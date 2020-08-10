import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './timer.scss';
import { setTimeElapsed } from '../../redux/actions/entryActions.js';

function Timer({ setTimeElapsed, timerActive }) {
	const [minutes, setMinutes] = useState(0);
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		let secondsInterval = null;
		if (timerActive) {
			secondsInterval = setInterval(() => {
				setSeconds((seconds) => seconds + 1);
				setTimeElapsed(`${minutes}:${seconds}`);
			}, 1000);
		} else if (!timerActive && seconds !== 0) {
			clearInterval(secondsInterval);
		}
		if (timerActive && seconds === 59) {
			setSeconds(0);
			setMinutes((minutes) => minutes + 1);
		}
		return () => clearInterval(secondsInterval);
	}, [timerActive, seconds, minutes]);

	return (
		<div className="timer">
			{minutes}m:{seconds}s
		</div>
	);
}

const mapStateToProps = (state) => ({
	timeElapsed: state.entries.timeElapsed,
	timerActive: state.entries.timerActive
});

export default connect(mapStateToProps, {
	setTimeElapsed
})(Timer);
