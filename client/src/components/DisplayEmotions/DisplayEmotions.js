import React from 'react';
const DisplayEmotions = (props) => {
	if (props.data) {
		let highestRankEmotion = Object.values(props.data)
			.sort((a, b) => a - b)
			.reverse()[0];
		let secondHighestRankEmotion = Object.values(props.data)
			.sort((a, b) => a - b)
			.reverse()[1];
		let predominateEmotion = Object.keys(props.data).find((key) => props.data[key] === highestRankEmotion);
		let secondMostPredominateEmotion = Object.keys(props.data).find(
			(key) => props.data[key] === secondHighestRankEmotion
		);
		if (predominateEmotion === 'Sad') {
			predominateEmotion = 'Sadness';
		}
		if (secondMostPredominateEmotion === 'Sad') {
			secondMostPredominateEmotion = 'Sadness';
		}
		if (predominateEmotion === 'Happy') {
			predominateEmotion = 'Happiness';
		}
		if (secondMostPredominateEmotion === 'Happy') {
			secondMostPredominateEmotion = 'Happiness';
		}
		if (predominateEmotion === 'Excited') {
			predominateEmotion = 'Excitement';
		}
		if (secondMostPredominateEmotion === 'Excited') {
			secondMostPredominateEmotion = 'Excitement';
		}
		if (predominateEmotion === 'Bored') {
			predominateEmotion = 'Boredom';
		}
		if (secondMostPredominateEmotion === 'Boredom') {
			secondMostPredominateEmotion = 'Boredom';
		}
		if (predominateEmotion === 'Angry') {
			predominateEmotion = 'Anger';
		}
		if (secondMostPredominateEmotion === 'Angry') {
			secondMostPredominateEmotion = 'Anger';
		}
		return (
			<p style={{ fontSize: '1.2em', color: 'silver' }}>
				Your most prominent emotion in this entry was{' '}
				<span style={{ color: 'white' }}>{predominateEmotion}</span>, followed closely by{' '}
				<span style={{ color: 'white' }}>{secondMostPredominateEmotion}</span>.
				<span style={{ fontSize: '0.7em', color: 'grey' }}>
					{' '}
					(according to the Paralell Dots Emotional Analysis API)
				</span>
			</p>
		);
	}
};

export default DisplayEmotions;
