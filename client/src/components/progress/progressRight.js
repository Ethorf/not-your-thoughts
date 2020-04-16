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

const ProgressWord = ({ wordCount, user }) => {
	let progressWordContainer = useRef(null);
	let progressNumberContainer = useRef(null);

	const [progressWordAnimation, setProgressAnimation] = useState(null);
	const tl = new TimelineMax({ paused: true });

	const progressAnimation = () => {
		setProgressAnimation(
			tl
				.to(progressNumberContainer, { duration: 1.5, opacity: 1 })
				.to(progressWordContainer, { duration: 1.5, opacity: 1 })
				.play()
		);
	};
	const progressAnimationReverse = () => {
		setProgressAnimation(
			tl
				.to(progressNumberContainer, { duration: 1.5, opacity: 0 })
				.to(progressWordContainer, { duration: 1.5, opacity: 0 })
				.play()
		);
	};
	const percentCalc = (wordCount, goal) => {
		if (wordCount >= goal / 4 && wordCount <= goal / 4 + 10) {
			return '25%';
		} else if (wordCount >= goal / 2 && wordCount <= goal / 2 + 10) {
			return '50%';
		} else if (wordCount >= goal * 0.75 && wordCount <= goal * 0.75 + 10) {
			return '75%';
		} else if (wordCount >= goal && wordCount <= goal + 10) {
			return '100%';
		}
	};

	useEffect(() => {
		if (wordCount === user.dailyWordsGoal / 4) {
			progressAnimation();
			if (user && user.progressAudioEnabled) {
				progressSound25.play();
			}
		} else if (wordCount === user.dailyWordsGoal / 4 + 5) {
			progressAnimationReverse();
		} else if (wordCount === user.dailyWordsGoal / 2) {
			progressAnimation();
			if (user && user.progressAudioEnabled) {
				progressSound50.play();
			}
		} else if (wordCount === user.dailyWordsGoal / 2 + 8) {
			progressAnimationReverse();
		} else if (wordCount === user.dailyWordsGoal * 0.75) {
			progressAnimation();
			if (user && user.progressAudioEnabled) {
				progressSound75.play();
			}
		} else if (wordCount === user.dailyWordsGoal * 0.75 + 8) {
			progressAnimationReverse();
		} else if (wordCount === user.dailyWordsGoal) {
			progressAnimation();
			if (user && user.progressAudioEnabled) {
				progressSound100.play();
			}
		}
	}, [wordCount, user.dailyWordsGoal]);
	return (
		<div>
			<h2 ref={(h2) => (progressNumberContainer = h2)} className="main__progress-number">
				{percentCalc(wordCount, user.dailyWordsGoal)}
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
	user: state.auth.user
});

export default connect(mapStateToProps)(ProgressWord);
