import React from 'react';
import { Input } from '@material-ui/core';
import './gratitude.scss';

export const Gratitude = (props) => {
	return (
		<form className={`gratitude`}>
			<h2 className={`gratitude__header`}>Quickly Describe 6 things you are grateful for</h2>
			<div className={`gratitude__two-input-container`}>
				<Input disableUnderline="true" placeholder="gratitude here"></Input>
				<Input disableUnderline="true" placeholder="gratitude here"></Input>
			</div>
			<div className={`gratitude__two-input-container`}>
				<Input disableUnderline="true" placeholder="gratitude here"></Input>
				<Input disableUnderline="true" placeholder="gratitude here"></Input>
			</div>
			<div className={`gratitude__two-input-container`}>
				<Input disableUnderline="true" placeholder="gratitude here"></Input>
				<Input disableUnderline="true" placeholder="gratitude here"></Input>
			</div>
			<button onClick={props.closeGratitude} className={`gratitude__done-button`}>
				Done
			</button>
		</form>
	);
};

export default Gratitude;
