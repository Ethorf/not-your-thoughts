import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './prompt.scss';
import axios from 'axios';
import { useHotkeys } from 'react-hotkeys-hook';
import firstIcon from '../../assets/Icons/prompt-icons/first-gray.png';
import previousIcon from '../../assets/Icons/prompt-icons/previous-gray.png';
import shuffleIcon from '../../assets/Icons/prompt-icons/shuffle-gray.png';
import nextIcon from '../../assets/Icons/prompt-icons/next-gray.png';
import lastIcon from '../../assets/Icons/prompt-icons/last-gray.png';

const Prompt = ({ auth: { user } }) => {
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
	}, [customPromptContent]);
	let customPromptArr = user.customPrompts.map((item) => {
		return item.content;
	});

	const argsShuffle = () => {
		if (user) {
			setCustomPromptContent(user.customPrompts[randomNum(user.customPrompts.length - 1)].content);
		}
	};
	const prev = () => {
		setCustomPromptContent((jim) => {
			if (customPromptArr.indexOf(jim) > 0) {
				return user.customPrompts[customPromptArr.indexOf(jim) - 1].content;
			}
			return jim;
		});
	};

	const next = () => {
		setCustomPromptContent((jim) => {
			if (customPromptArr.indexOf(jim) < user.customPrompts.length - 1) {
				return user.customPrompts[customPromptArr.indexOf(jim) + 1].content;
			}
			return jim;
		});
	};
	const first = () => {
		if (user) {
			setCustomPromptContent(user.customPrompts[0].content);
		}
	};
	const last = () => {
		if (user) {
			setCustomPromptContent(user.customPrompts[customPromptArr.length - 1].content);
		}
	};
	useHotkeys(
		'ctrl+s',
		() => {
			argsShuffle();
		},
		{ enableOnTags: ['TEXTAREA'] }
	);
	useHotkeys(
		'ctrl+f',
		() => {
			first();
		},
		{ enableOnTags: ['TEXTAREA'] }
	);
	useHotkeys(
		'ctrl+n',
		() => {
			next();
		},
		{ enableOnTags: ['TEXTAREA'] }
	);
	useHotkeys(
		'ctrl+p',
		() => {
			prev();
		},
		{ enableOnTags: ['TEXTAREA'] }
	);
	useHotkeys(
		'ctrl+l',
		() => {
			last();
		},
		{ enableOnTags: ['TEXTAREA'] }
	);

	return user && user.customPromptsEnabled ? (
		<div className={`prompt`}>
			<h2 className={`prompt__content`}>
				{customPromptArr.indexOf(customPromptContent) + 1}.{'  '} {customPromptContent}
			</h2>
			<div className={`prompt__buttons-container`}>
				<img
					className={`tooltip prompt__first-button prompt__button ${
						customPromptArr.indexOf(customPromptContent) === 0 ? 'red' : ''
					}`}
					onClick={first}
					src={firstIcon}
					alt="go to first prompt"
					title="Go to first prompt, Ctrl + f"
				></img>
				<img
					className={`tooltip prompt__previous-button prompt__button ${
						customPromptArr.indexOf(customPromptContent) === 0 ? 'red' : ''
					}`}
					onClick={prev}
					src={previousIcon}
					alt="go to previous prompt"
					title="Go to previous prompt, Ctrl + p"
				></img>
				<img
					className={`tooltip prompt__shuffle-button prompt__button`}
					onClick={() => {
						argsShuffle(setCustomPromptContent, user);
					}}
					src={shuffleIcon}
					alt="shuffle prompt"
					title="Shuffle prompt, Ctrl + s"
				></img>
				<img
					className={`tooltip prompt__next-button prompt__button ${
						customPromptArr.indexOf(customPromptContent) === customPromptArr.length - 1 ? 'red' : ''
					}`}
					onClick={next}
					src={nextIcon}
					alt="go to next prompt"
					title="Go to next prompt, Ctrl + n"
				></img>
				<img
					className={`tooltip prompt__last-button prompt__button ${
						customPromptArr.indexOf(customPromptContent) === customPromptArr.length - 1 ? 'red' : ''
					}`}
					onClick={last}
					src={lastIcon}
					alt="go to last prompt"
					title="Go to last prompt, Ctrl + l"
				></img>
			</div>
		</div>
	) : (
		<div className={`prompt`}>
			<h2>{promptContent}</h2>
		</div>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	user: state.auth.user
});

export default connect(mapStateToProps, {})(Prompt);
