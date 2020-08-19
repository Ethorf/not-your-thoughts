import React, { useRef, useEffect, useState } from 'react';
import { TimelineMax } from 'gsap';
import '../../pages/main/main.scss';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import progressSound25File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-25-progressSound.mp3';
import progressSound50File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-50-progressSound.mp3';
import progressSound75File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-75-progressSound.mp3';
import progressSound100File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-100-progressSound.mp3';

const progressSound25 = new Audio(progressSound25File);
const progressSound50 = new Audio(progressSound50File);
const progressSound75 = new Audio(progressSound75File);
const progressSound100 = new Audio(progressSound100File);

const ProgressWord = ({ wordCount, user, timeElapsed }) => {
	let progressWordContainer = useRef(null);
	let progressNumberContainer = useRef(null);
	const [animationReady, setAnimationReady] = useState(true);
	const [progressWordAnimation, setProgressAnimation] = useState(null);
	const tl = new TimelineMax({ paused: true });

	let userGoal;
	let goalCount;

	const progressAnimation = () => {
		setAnimationReady(false);
		setProgressAnimation(
			tl
				.to(progressNumberContainer, { duration: 1, opacity: 1 })
				.to(progressWordContainer, { duration: 1, opacity: 1 })
				.to(progressNumberContainer, { delay: 0.3, duration: 0.8, opacity: 0 })
				.to(progressWordContainer, { duration: 0.8, opacity: 0 })
				.play()
		);
		setTimeout(() => setAnimationReady(true), 4000);
	};
	const percentCalc = (goalCount, userGoal) => {
		if (goalCount >= userGoal / 4 && goalCount <= userGoal / 4 + 6) {
			return '25%';
		} else if (goalCount >= userGoal / 2 && goalCount <= userGoal / 2 + 10) {
			return '50%';
		} else if (goalCount >= userGoal * 0.75 && goalCount <= userGoal * 0.75 + 10) {
			return '75%';
		} else if (goalCount >= userGoal && goalCount <= userGoal + 10) {
			return '100%';
		}
	};

	useEffect(() => {
		if (user.goalPreference === 'words') {
			userGoal = user.dailyWordsGoal;
			goalCount = wordCount;
		} else if (user.goalPreference === 'time') {
			userGoal = user.dailyTimeGoal * 60;
			goalCount = timeElapsed;
		}

		if (animationReady && goalCount === userGoal / 4) {
			progressAnimation();
			if (user && user.progressAudioEnabled) {
				progressSound25.play();
			}
		} else if (animationReady && goalCount === userGoal / 2) {
			progressAnimation();
			if (user && user.progressAudioEnabled) {
				progressSound50.play();
			}
		} else if (animationReady && goalCount === userGoal * 0.75) {
			progressAnimation();
			if (user && user.progressAudioEnabled) {
				progressSound75.play();
			}
		} else if (animationReady && goalCount === userGoal) {
			progressAnimation();
			if (user && user.progressAudioEnabled) {
				progressSound100.play();
			}
		}
	}, [goalCount, userGoal, timeElapsed, wordCount]);
	return (
		<div>
			<h2 ref={(h2) => (progressNumberContainer = h2)} className="main__progress-number">
				{user.goalPreference === 'words'
					? percentCalc(wordCount, user.dailyWordsGoal)
					: percentCalc(timeElapsed, user.dailyTimeGoal * 60)}
			</h2>
			<h2 ref={(h2) => (progressWordContainer = h2)} className="main__progress-word">
				Complete
			</h2>
		</div>
	);
};

ProgressWord.propTypes = {
	wordCount: PropTypes.number
};

const mapStateToProps = (state) => ({
	wordCount: state.wordCount.wordCount,
	goal: state.wordCount.goal,
	user: state.auth.user,
	timeElapsed: state.entries.timeElapsed
});

export default connect(mapStateToProps)(ProgressWord);
