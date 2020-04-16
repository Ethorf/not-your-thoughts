import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import '../../styles/rubberDucky.scss';
import './prompt.scss';
import axios from 'axios';

const Prompt = ({ user }) => {
	const randomNum = (max) => {
		return Math.floor(Math.random() * max);
	};
	const [promptContent, setPromptContent] = useState('The Milk is the Bag that you have become all along');
	const [customPromptContent, setCustomPromptContent] = useState(
		user ? user.customPrompts[randomNum(user.customPrompts.length - 1)].content : null
	);
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

		return user && user.customPromptsEnabled ? (
			<div className={`prompt`}>
				<h2>{customPromptContent}</h2>
				<div className={`prompt__buttons-container`}>
					<span className={`prompt__previous-button prompt__button`} onClick={prev}>
						prev
					</span>
					<span className={`prompt__next-button prompt__button`} onClick={next}>
						next
					</span>
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
	user: state.auth.user
});

export default connect(mapStateToProps, {})(Prompt);
