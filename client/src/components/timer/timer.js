import React, { useState, useEffect } from 'react';
import './timer.scss';

export default function Timer(props) {
	const [minutes, setMinutes] = useState(0);
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		let secondsInterval = null;
		if (props.timerActive) {
			secondsInterval = setInterval(() => {
				setSeconds((seconds) => seconds + 1);
			}, 1000);
		} else if (!props.timerActive && seconds !== 0) {
			clearInterval(secondsInterval);
		}
		if (props.timerActive && seconds === 59) {
			setSeconds(0);
			setMinutes((minutes) => minutes + 1);
		}
		return () => clearInterval(secondsInterval);
	}, [props.timerActive, seconds, minutes]);

	return (
		<div className="timer">
			<div>
				{minutes}:{seconds}s
			</div>
		</div>
	);
}
