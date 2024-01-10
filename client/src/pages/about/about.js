import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { TimelineMax } from 'gsap';

import './about.scss';

function About({ mode }) {
	//Modal

	const contentTl = new TimelineMax({ paused: true });
	let modalContentContainer = useRef(null);
	const [contentAnimation, setContentAnimation] = useState(null);
	const openModalContentAnimation = () => {
		setContentAnimation(
			contentTl
				.to(modalContentContainer, { duration: 0.2, y: 20, opacity: 1 })
				.to(modalContentContainer, { duration: 2.3, opacity: 1 })
				.to(modalContentContainer, { duration: 0.5, y: -20, opacity: 0 })
				.play()
		);
	};
	//Formage
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		message: 'message'
	});

	const { name, email, message } = formData;
	const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
	const submitContact = ({ name, email, message }) => {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		};
		const body = JSON.stringify({ name, email, message });
		try {
			axios.post('/api/contact', body, config);
		} catch (err) {
			console.log('Error submitting form ');
		}
	};
	const onSubmit = (e) => {
		e.preventDefault();
		submitContact({ name, email, message });
		openModalContentAnimation();
	};

	return (
		<div className={`about ${mode}`}>
			<h1 className={'about__header'}>About / Contact</h1>
			<h3 className={`about__description ${mode}`}>
				Not Your Thoughts is independently developed by Eric Thorfinnson, and he did all the stuff. As a
				long-time meditator, he has found journalling to be a very helpful practice to integrate mindfulness
				into everyday life, and to untangle particularily persistent mental brambles. Like something, or not?
				Bristling with prickly functionality suggestions? Let me know below!
			</h3>
			<h2 className={'about__header about__form-header'}>Get In Touch</h2>
			<form onSubmit={(e) => onSubmit(e)} className={'about__form'}>
				<div className={`about__form-name-email-input-modalize-container`}>
					<div className={`about__form-name-email-input-container`}>
						<h3 className={'about__form-identifier'}>Name:</h3>
						<input
							name="name"
							value={name}
							onChange={(e) => onChange(e)}
							placeholder="Your name here"
							className={`about__input about__name ${mode}`}
							required
						></input>
						<h3 className={'about__form-identifier'}>Email:</h3>
						<input
							placeholder="Your email here"
							type="email"
							name="email"
							className={`about__input ${mode}`}
							onChange={(e) => onChange(e)}
							required
						></input>
					</div>
					<h2 ref={(h2) => (modalContentContainer = h2)} className={'about__modalize'}>
						Message Submitted
					</h2>
				</div>

				<h3 className={'about__form-identifier'}>Message:</h3>
				<textarea
					required
					placeholder="Your message here"
					name="message"
					// value={message}
					onChange={(e) => onChange(e)}
					className={`about__input about__message ${mode}`}
				></textarea>
				<button className={'about__form-submit-button'} type="submit">
					Submit
				</button>
			</form>
		</div>
	);
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	wordCount: state.wordCount.wordCount,
	goal: state.wordCount.goal,
	isAuthenticated: state.auth.isAuthenticated,
	modals: state.modals,
	mode: state.modes.mode
});

export default connect(mapStateToProps)(About);
