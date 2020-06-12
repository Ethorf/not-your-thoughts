import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './prompt.scss';
import axios from 'axios';
import { useHotkeys } from 'react-hotkeys-hook';

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
			if (customPromptArr.indexOf(jim) < user.customPrompts.length > 0) {
				return user.customPrompts[customPromptArr.indexOf(jim) - 1].content;
			}
			return jim;
		});
	};
	// const nextOld = () => {
	// 	if (user) {
	// 		if (customPromptArr.indexOf(customPromptContent) < user.customPrompts.length - 1) {
	// 			setCustomPromptContent(user.customPrompts[customPromptArr.indexOf(customPromptContent) + 1].content);
	// 		}
	// 	}
	// };
	const next = () => {
		// if (user) {
		//kind of feels like this is implicitly doing something like state.setCustomPromptContent, or rather customPromptContent
		setCustomPromptContent((jim) => {
			if (customPromptArr.indexOf(jim) < user.customPrompts.length - 1) {
				return user.customPrompts[customPromptArr.indexOf(jim) + 1].content;
			}
			return jim;
		});
		// }
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
			<h2 className={`prompt__content`}>{customPromptContent}</h2>
			<div className={`prompt__buttons-container`}>
				<div
					className={`tooltip prompt__previous-button prompt__button ${
						customPromptArr.indexOf(customPromptContent) === 0 ? 'red' : ''
					}`}
					onClick={first}
				>
					first
					<span className="tooltiptext">First, ctrl + f</span>
				</div>
				<div
					className={`tooltip prompt__previous-button prompt__button ${
						customPromptArr.indexOf(customPromptContent) === 0 ? 'red' : ''
					}`}
					onClick={prev}
				>
					prev
					<span className="tooltiptext">Previous, ctrl + p</span>
				</div>
				<div
					className={`tooltip prompt__shuffle-button prompt__button`}
					onClick={() => {
						argsShuffle(setCustomPromptContent, user);
					}}
				>
					shuffle
					<span className="tooltiptext">Shuffle, ctrl + s</span>
				</div>
				<div
					className={`tooltip prompt__next-button prompt__button ${
						customPromptArr.indexOf(customPromptContent) === customPromptArr.length - 1 ? 'red' : ''
					}`}
					onClick={next}
				>
					next
					<span className="tooltiptext">next, ctrl + n</span>
				</div>
				<div
					className={`tooltip prompt__next-button prompt__button ${
						customPromptArr.indexOf(customPromptContent) === customPromptArr.length - 1 ? 'red' : ''
					}`}
					onClick={last}
				>
					last
					<span className="tooltiptext">last, ctrl + l</span>
				</div>
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
