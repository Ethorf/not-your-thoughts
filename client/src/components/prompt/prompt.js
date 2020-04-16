import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import '../../styles/rubberDucky.scss';
import './prompt.scss';
import axios from 'axios';

const Prompt = ({ customPromptsEnabled, prompts, user }) => {
	const randomNum = (max) => {
		return Math.floor(Math.random() * max);
	};
	const [promptContent, setPromptContent] = useState('The Milk is the Bag that you have become all along');
	const [customPromptContent, setCustomPromptContent] = useState(prompts[randomNum(prompts.length - 1)].content);
	let customPromptArr = prompts.map((item) => {
		return item.content;
	});
	const getPrompts = () => {
		axios
			.get('/prompts/')
			.then((response) => {
				setPromptContent(response.data[randomNum(response.data.length - 1)]);
			})
			.catch((error) => console.log(error, 'you had errorboi getPrompts'));
	};

	const shuffle = () => {
		setCustomPromptContent(prompts[randomNum(prompts.length - 1)].content);
	};
	const prev = () => {
		if (customPromptArr.indexOf(customPromptContent) > 0) {
			setCustomPromptContent(prompts[customPromptArr.indexOf(customPromptContent) - 1].content);
		}
	};
	const next = () => {
		if (customPromptArr.indexOf(customPromptContent) < prompts.length - 1) {
			setCustomPromptContent(prompts[customPromptArr.indexOf(customPromptContent) + 1].content);
		}
	};
	useEffect(() => {
		getPrompts();
	}, []);

	return user && customPromptsEnabled ? (
		<div className={`prompt`}>
			{customPromptContent}
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
};

const mapStateToProps = (state) => ({
	prompts: state.auth.user.customPrompts,
	user: state.auth.user,
	addPromptOpen: state.auth.addPromptOpen,
	customPromptsEnabled: state.auth.customPromptsEnabled
});

export default connect(mapStateToProps, {})(Prompt);
