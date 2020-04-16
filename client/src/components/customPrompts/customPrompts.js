import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './customPrompts.scss';
import '../../pages/profile/profile.scss';

import {
	addCustomPrompt,
	deleteCustomPrompt,
	toggleAddPromptOpen,
	toggleCustomPromptsEnabled
} from '../../redux/actions/authActions';

const CustomPrompts = ({
	addCustomPrompt,
	deleteCustomPrompt,
	prompts,
	addPromptOpen,
	toggleAddPromptOpen,
	toggleCustomPromptsEnabled,
	customPromptsEnabled
}) => {
	const [promptData, setPromptData] = useState({
		prompt: ''
	});
	const [localCustomPromptsEnabled, setLocalCustomPromptsEnabled] = useState(customPromptsEnabled);
	const togglePrompts = () => {
		setLocalCustomPromptsEnabled(!localCustomPromptsEnabled);
		toggleCustomPromptsEnabled();
	};
	const promptInput = (e) => {
		e.preventDefault();
		setPromptData(e.target.value);
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		addCustomPrompt({ prompt: promptData });
	};
	useEffect(() => {
		setLocalCustomPromptsEnabled(customPromptsEnabled);
	}, []);
	return (
		<div className={`custom-prompts`}>
			<div className={`custom-prompts__toggle`}>
				<h2>Custom Prompts:</h2>
				<div className={`profile__toggle-switch`} onClick={togglePrompts}>
					<span className={`${localCustomPromptsEnabled ? 'profile__active' : 'profile__inactive'}`}>On</span>
					<span className={` ${localCustomPromptsEnabled ? 'profile__inactive' : 'profile__active'}`}>
						Off
					</span>
				</div>
			</div>
			<div className={localCustomPromptsEnabled ? 'visible' : 'invisible'}>
				<h2>
					Your Prompts
					<span onClick={toggleAddPromptOpen} className={`custom-prompts__add-new`}>
						{' '}
						Add New +
					</span>
					<form className={`${addPromptOpen === true ? 'custom-prompts__add-prompt-input' : 'invisible'}`}>
						<input onChange={promptInput} placeholder="your prompt here"></input>
						<button onClick={onSubmit} type="submit">
							Add Prompt
						</button>
					</form>
				</h2>
				<ul>
					{prompts.map((prompt) => {
						return (
							<li className={`custom-prompts__prompt`} key={prompt.id} id={prompt.id}>
								{prompt.content}
								<span
									className={`custom-prompts__delete-button`}
									onClick={() => {
										deleteCustomPrompt(prompt.id);
									}}
								>
									X
								</span>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
};

CustomPrompts.propTypes = {
	auth: PropTypes.object.isRequired,
	prompts: PropTypes.array.isRequired,
	customPromptsEnabled: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
	prompts: state.auth.user.customPrompts,
	addPromptOpen: state.auth.addPromptOpen,
	customPromptsEnabled: state.auth.user.customPromptsEnabled
});

export default connect(mapStateToProps, {
	addCustomPrompt,
	deleteCustomPrompt,
	toggleAddPromptOpen,
	toggleCustomPromptsEnabled
})(CustomPrompts);
