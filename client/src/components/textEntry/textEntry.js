import React, { useState, useEffect } from 'react';
import { Redirect, StaticRouter } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';

import '../../pages/main/main.scss';
// import Timer from '../timer/timer.js';

//Redux Function Imports
import { connect } from 'react-redux';
import { changeWordCount } from '../../redux/actions/index';
import { saveEntry, setEntry } from '../../redux/actions/entryActions.js';
import { openSuccessModal, openSaveEntryModal } from '../../redux/actions/modalActions';
import { changeMode } from '../../redux/actions/modeActions';
import { increaseDays } from '../../redux/actions/authActions.js';

//Component Imports
import Header from '../../components/header/header';
import BgImage from '../../components/bgImage/bgImage.js';
import Prompt from '../prompt/prompt.js';
import PillarTop from '../pillars/pillarTop.js';
import PillarLeft from '../pillars/pillarLeft.js';
import PillarRight from '../pillars/pillarRight.js';
import PillarBottom from '../pillars/pillarBottom.js';
import ProgressWord from '../../components/progress/progressRight.js';
import SuccessModal from '../Modals/successModal.js';
import IntroModal from '../Modals/introModal.js';
import SaveEntryModal from '../Modals/saveEntryModal.js';
import Spinner from '../spinner/spinner';

function Timer(props) {
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

const TextEntry = ({
	openSaveEntryModal,
	wordCount,
	changeWordCount,
	saveEntry,
	isAuthenticated,
	setEntry,
	mode,
	auth: { user },
	entry
}) => {
	const [entryData, setEntryData] = useState({
		entry: ''
	});
	const [timerActive, setTimerActive] = useState(false);

	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}

	const textNum = (e) => {
		e.preventDefault();
		setEntryData(e.target.value);
		setEntry(e.target.value);
		changeWordCount(e.target.value.split(' ').filter((item) => item !== '').length);
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		openSaveEntryModal();
		saveEntry({ entry: entryData });
	};
	return user === null ? (
		<Spinner />
	) : (
		<>
			<BgImage />
			<div className={`main__all-container modalize ${mode}`}>
				<div className={`main ${mode}`}>
					<Header />
					<SaveEntryModal />
					<SuccessModal timerActive={timerActive} setTimerActive={setTimerActive} />
					<IntroModal />
					<Prompt />
					<ProgressWord />
					<PillarTop />

					<div className={`main__pillars-date-goal-wordcount-textarea-container`}>
						<PillarLeft />
						<form className={`main__date-goal-wordcount-textarea-container`} onSubmit={(e) => onSubmit(e)}>
							<div className={`main__date-goal-wordcount-container${mode}`}>
								<h3 className={`main__date `}>{moment().format('MM/DD/YYYY')}</h3>
								<h2 className={`main__goal`}>
									Goal: {user ? user.dailyWordsGoal : 'loading daily goal'} Words
								</h2>
								<Timer timerActive={timerActive} />
								<h3 className={`main__wordcount`}>{wordCount} Words</h3>
							</div>
							<div className={`main__textarea-border ${mode}`}>
								<textarea
									onChange={textNum}
									name="textEntry"
									className={`main__textarea${mode}`}
									placeholder="note those thoughts here"
									value={entry}
								></textarea>
							</div>

							<div className={`main__save-entry-button-container  `}>
								<button onClick={onSubmit} type="submit" className={`main__save-entry-button${mode}`}>
									Save Entry
								</button>
							</div>
						</form>
						<PillarRight />
					</div>

					<PillarBottom />
				</div>
			</div>
		</>
	);
};

TextEntry.propTypes = {
	auth: PropTypes.object.isRequired,
	saveEntry: PropTypes.func.isRequired,
	setEntry: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	wordCount: state.wordCount.wordCount,
	goal: state.wordCount.goal,
	isAuthenticated: state.auth.isAuthenticated,
	modals: state.modals,
	mode: state.modes.mode,
	entry: state.entries.entry
});

export default connect(mapStateToProps, {
	saveEntry,
	openSaveEntryModal,
	openSuccessModal,
	changeWordCount,
	setEntry,
	increaseDays,
	changeMode
})(TextEntry);
