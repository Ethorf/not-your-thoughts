//Package Imports
import React, { useState, useRef, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { TimelineMax } from 'gsap';
import moment from 'moment';
import PropTypes from 'prop-types';
//SCSS
import '../../pages/main/main.scss';
//Redux Function Imports
import { connect } from 'react-redux';
import { changeWordCount, changeCharCount } from '../../redux/actions/index';
import { saveEntry, setEntry, toggleTimerActive } from '../../redux/actions/entryActions.js';
import { openSuccessModal, openSaveEntryModal } from '../../redux/actions/modalActions';
import { changeMode } from '../../redux/actions/modeActions';
import { increaseDays } from '../../redux/actions/authActions.js';

//Component Imports
import Header from '../../components/header/header';
import BgImage from '../../components/bgImage/bgImage.js';
import Prompt from '../../components/prompt/prompt.js';
import PillarTop from '../../components/pillars/pillarTop.js';
import PillarLeft from '../../components/pillars/pillarLeft.js';
import PillarRight from '../../components/pillars/pillarRight.js';
import PillarBottom from '../../components/pillars/pillarBottom.js';
import ProgressWord from '../../components/progress/progressWord.js';
import SuccessModal from '../../components/Modals/successModal.js';
import IntroModal from '../../components/Modals/introModal.js';
import SaveEntryModal from '../../components/Modals/saveEntryModal.js';
import Spinner from '../../components/spinner/spinner';
import TimerDisplay from '../../components/timerDisplay/timerDisplay';

const Main = ({
	openSaveEntryModal,
	wordCount,
	charCount,
	changeCharCount,
	changeWordCount,
	saveEntry,
	isAuthenticated,
	setEntry,
	mode,
	auth: { user },
	entry,
	timeElapsed,
	guestMode
}) => {
	const textAreaTl = new TimelineMax({ paused: true });
	let textAreaRef = useRef(null);

	const [entryData, setEntryData] = useState({
		entry: ''
	});
	const [wpmCalc, setWpmCalc] = useState(Math.trunc((charCount / 5 / timeElapsed) * 60));
	const [wpmCounter, setWpmCounter] = useState(0);
	const [readyToAnimateText, setReadyToAnimateText] = useState(true);
	const [textAreaAnimation, setTextAreaAnimation] = useState(null);

	useEffect(() => {
		// setWpmCalc((timeElapsed / 2) % 5 === 0 ? Math.trunc((charCount / 5 / timeElapsed) * 60) : wpmCalc);
		let wpmInterval = null;
		wpmInterval = setInterval(() => {
			setWpmCounter(wpmCalc);
		}, 2000);
		return () => clearInterval(wpmInterval);
	}, [charCount, timeElapsed, wpmCalc, wpmCounter]);

	if (!guestMode && !isAuthenticated) {
		return <Redirect to="/login" />;
	}
	const textDissapearingAnim = () => {
		if (readyToAnimateText) {
			setReadyToAnimateText(false);

			setTextAreaAnimation(
				textAreaTl
					.from(textAreaRef, {
						duration: 0.4,
						x: 1,
						opacity: 0.8,
						ease: 'power1.out'
					})
					.to(textAreaRef, {
						duration: 0.8,
						x: -1,
						opacity: 0,
						ease: 'power1.out'
					})
					.to(textAreaRef, {
						duration: 0.8,
						y: 10,
						opacity: 0.2,
						ease: 'power1.out'
					})
					.to(textAreaRef, {
						duration: 2.8,
						x: -1,
						opacity: 0,
						ease: 'power1.out'
					})
					.play()
			);
			setTimeout(() => {
				setReadyToAnimateText(true);
			}, 6800);
		}
	};

	const textNum = (e) => {
		e.preventDefault();
		setEntryData(e.target.value);
		setEntry(e.target.value);
		changeWordCount(e.target.value.split(' ').filter((item) => item !== '').length);
		changeCharCount(e.target.value.split('').length);
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		openSaveEntryModal();
		saveEntry({ entry: entryData, timeElapsed: timeElapsed, wpm: Math.trunc((charCount / 5 / timeElapsed) * 60) });
	};
	return user === null && !guestMode ? (
		<Spinner />
	) : (
		<>
			<div className={`main__all-container modalize ${mode}`}>
				<BgImage />
				<div className={`main ${mode}`}>
					<Header />
					<SaveEntryModal />
					<SuccessModal />
					<IntroModal />
					<Prompt />
					<ProgressWord />
					<PillarTop />
					<div className={`main__pillars-date-goal-wordcount-textarea-container`}>
						<PillarLeft />
						<form className={`main__date-goal-wordcount-textarea-container`} onSubmit={(e) => onSubmit(e)}>
							<div className={`main__date-goal-wordcount-container${mode}`}>
								<h3 className={`main__date `}>{moment().format('MM/DD/YYYY')}</h3>
								<span
									className={'main__timer-display'}
									style={guestMode || user.timerEnabled ? { opacity: 1 } : { opacity: 0 }}
								>
									<TimerDisplay />
								</span>

								{guestMode ? (
									<h2 className={`main__goal`}>Goal: 200 words</h2>
								) : (
									<h2 className={`main__goal`}>
										Goal:{' '}
										{user.goalPreference === 'words'
											? `${user.dailyWordsGoal} Words`
											: `${user.dailyTimeGoal} Minute${user.dailyTimeGoal >= 2 ? 's' : ''}`}
									</h2>
								)}

								<h3
									className={`main__wpm-text-container`}
									style={guestMode || user.wpmEnabled ? { opacity: 1 } : { opacity: 0 }}
								>
									<div className={`main__wpm-text-left`}>
										{charCount >= 20 ? Math.trunc((charCount / 5 / timeElapsed) * 60) : 'N/A'}
									</div>
									<div className={`main__wpm-text-right`}> WPM</div>
								</h3>
								<h3 className={`main__wordcount`}>
									<span style={{ color: 'white', marginRight: '5px' }}>{wordCount}</span> Words
								</h3>
							</div>
							<div className={`main__textarea-border ${mode}`}>
								<textarea
									onChange={textNum}
									name="textEntry"
									className={`main__textarea${mode} ${mode === ' blind' ? 'textblind' : null}`}
									placeholder="note those thoughts here"
									value={entry}
									ref={(textarea) => (textAreaRef = textarea)}
									spellCheck="false"
								></textarea>
							</div>

							<div className={`main__save-entry-button-container  `}>
								{guestMode ? null : (
									<button
										onClick={onSubmit}
										type="submit"
										className={`main__save-entry-button${mode}`}
									>
										Save Entry
									</button>
								)}
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

Main.propTypes = {
	auth: PropTypes.object.isRequired,
	saveEntry: PropTypes.func.isRequired,
	setEntry: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	guestMode: state.auth.guestMode,
	wordCount: state.wordCount.wordCount,
	charCount: state.wordCount.charCount,
	goal: state.wordCount.goal,
	isAuthenticated: state.auth.isAuthenticated,
	modals: state.modals,
	mode: state.modes.mode,
	entry: state.entries.entry,
	timeElapsed: state.entries.timeElapsed,
	timerActive: state.entries.timerActive
});

export default connect(mapStateToProps, {
	saveEntry,
	openSaveEntryModal,
	openSuccessModal,
	changeWordCount,
	changeCharCount,
	setEntry,
	increaseDays,
	changeMode,
	toggleTimerActive
})(Main);
