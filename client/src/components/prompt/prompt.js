import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './prompt.scss';
import axios from 'axios';
import useKeyboardShortcut from 'use-keyboard-shortcut';

const Prompt = ({ auth: { user } }) => {
	const randomNum = (max) => {
		return Math.floor(Math.random() * max);
	};
	const [promptContent, setPromptContent] = useState('The Milk is the Bag that you have become all along');
	const [customPromptContent, setCustomPromptContent] = useState(
		user ? user.customPrompts[randomNum(user.customPrompts.length - 1)].content : null
	);
	useKeyboardShortcut(['control', 'H'], () => console.log('Shift + H has been pressed.'));

	const getPrompts = () => {
		axios
			.get('/prompts/')
			.then((response) => {
				setPromptContent(response.data[randomNum(response.data.length - 1)]);
			})
			.catch((error) => console.log(error, 'you had errorboi getPrompts'));
	};
	useEffect(() => {
		getPrompts();
	}, []);
	if (user) {
		let customPromptArr = user.customPrompts.map((item) => {
			return item.content;
		});

		const shuffle = () => {
			setCustomPromptContent(user.customPrompts[randomNum(user.customPrompts.length - 1)].content);
		};
		const prev = () => {
			if (customPromptArr.indexOf(customPromptContent) > 0) {
				setCustomPromptContent(user.customPrompts[customPromptArr.indexOf(customPromptContent) - 1].content);
			}
		};
		const next = () => {
			if (customPromptArr.indexOf(customPromptContent) < user.customPrompts.length - 1) {
				setCustomPromptContent(user.customPrompts[customPromptArr.indexOf(customPromptContent) + 1].content);
			}
		};
		const first = () => {
			setCustomPromptContent(user.customPrompts[0].content);
		};
		const last = () => {
			setCustomPromptContent(user.customPrompts[customPromptArr.length - 1].content);
		};

		return user && user.customPromptsEnabled ? (
			<div className={`prompt`}>
				<h2 className={`prompt__content`}>{customPromptContent}</h2>
				<div className={`prompt__buttons-container`}>
					<div
						className={`tooltip prompt__previous-button prompt__button ${
							customPromptArr.indexOf(customPromptContent) === 0 ? 'red' : ''
						}`}
						onClick={first}
					>
						first
						<span className="tooltiptext">first</span>
					</div>
					<div
						className={`tooltip prompt__previous-button prompt__button ${
							customPromptArr.indexOf(customPromptContent) === 0 ? 'red' : ''
						}`}
						onClick={prev}
					>
						prev
						<span className="tooltiptext">previous</span>
					</div>
					<div className={`tooltip prompt__shuffle-button prompt__button`} onClick={shuffle}>
						shuffle
						<span className="tooltiptext">Shuffle</span>
					</div>
					<div
						className={`tooltip prompt__next-button prompt__button ${
							customPromptArr.indexOf(customPromptContent) === customPromptArr.length - 1 ? 'red' : ''
						}`}
						onClick={next}
					>
						next
						<span className="tooltiptext">next</span>
					</div>
					<div
						className={`tooltip prompt__next-button prompt__button ${
							customPromptArr.indexOf(customPromptContent) === customPromptArr.length - 1 ? 'red' : ''
						}`}
						onClick={last}
					>
						last
						<span className="tooltiptext">last</span>
					</div>
				</div>
			</div>
		) : (
			<div className={`prompt`}>
				<h2>{promptContent}</h2>
			</div>
		);
	} else {
		return null;
	}
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	user: state.auth.user
});

export default connect(mapStateToProps, {})(Prompt);
