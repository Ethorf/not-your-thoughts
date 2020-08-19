import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './timer.scss';
import { setTimeElapsed } from '../../redux/actions/entryActions.js';

function Timer({ setTimeElapsed, timerActive }) {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		let secondsInterval = null;

		if (timerActive) {
			secondsInterval = setInterval(() => {
				setSeconds((seconds) => seconds + 1);
				setTimeElapsed(seconds);
			}, 100);
		}
		return () => clearInterval(secondsInterval);
	}, [timerActive, seconds]);

	return null;
}

const mapStateToProps = (state) => ({
	timerActive: state.entries.timerActive
});

export default connect(mapStateToProps, {
	setTimeElapsed
})(Timer);
