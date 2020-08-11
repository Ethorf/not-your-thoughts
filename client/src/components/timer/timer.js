import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './timer.scss';
import { setTimeElapsed } from '../../redux/actions/entryActions.js';

function Timer({ setTimeElapsed, timerActive, timeElapsed }) {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		let secondsInterval = null;

		if (timerActive) {
			secondsInterval = setInterval(() => {
				setSeconds((seconds) => seconds + 1);
				setTimeElapsed(seconds);
			}, 1000);
		}
		return () => clearInterval(secondsInterval);
	}, [timerActive, seconds]);

	return (
		<div className="timer">
			{Math.round(timeElapsed / 60)}m:{timeElapsed % 60}s
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
