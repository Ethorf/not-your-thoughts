import React, { Component } from 'react';
import { connect } from 'react-redux';
import './gratitude.scss';

export const Gratitude = (props) => {
	return (
		<form className={`gratitude`}>
			<h2 className={`gratitude__header`}>Quickly Describe 6 things you are grateful for</h2>
			<div className={`gratitude__two-input-container`}>
				<input className={`gratitude__input`} placeholder="gratitude here"></input>
				<input className={`gratitude__input`} placeholder="gratitude here"></input>
			</div>
			<div className={`gratitude__two-input-container`}>
				<input className={`gratitude__input`} placeholder="gratitude here"></input>
				<input className={`gratitude__input`} placeholder="gratitude here"></input>
			</div>
			<div className={`gratitude__two-input-container`}>
				<input className={`gratitude__input`} placeholder="gratitude here"></input>
				<input className={`gratitude__input`} placeholder="gratitude here"></input>
			</div>
			<button onClick={props.closeGratitude} className={`gratitude__done-button`}>
				Done
			</button>
		</form>
	);
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Gratitude);
