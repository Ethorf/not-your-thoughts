import React from 'react';
import { connect } from 'react-redux';
import '../../pages/main/main.scss';
import './timerDisplay.scss';
import '../../redux/actions';
import pause from '../../assets/Icons/Icon-pause.png';
import play from '../../assets/Icons/Icon-play.png';
import { toggleTimerActive } from '../../redux/actions/entryActions.js';

function TimerDisplay({ toggleTimerActive, timeElapsed, timerActive }) {
	return (
		<div className="timer">
			{Math.trunc(timeElapsed / 60)}m:{timeElapsed % 60}s
			<img
				className="timer__play-pause"
				onClick={() => toggleTimerActive(!timerActive)}
				src={timerActive ? pause : play}
			/>
		</div>
	);
}

const mapStateToProps = (state) => ({
	timeElapsed: state.entries.timeElapsed,
	timerActive: state.entries.timerActive
});

export default connect(mapStateToProps, {
	toggleTimerActive
})(TimerDisplay);
