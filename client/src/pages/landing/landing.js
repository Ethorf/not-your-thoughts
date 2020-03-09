import React from 'react';
import { Link } from 'react-router-dom';
import './landing.scss';
import { gsap } from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';
import { TimelineLite } from 'gsap/all';
import bgOverlayTextureWhite from '../../assets/Background-Images/background-texture-bigPan-white-blur.png';
gsap.registerPlugin(CSSPlugin);

export default class Landing extends React.Component {
	allContainer = null;
	allTween = null;
	logoContainer = null;
	logoTween = null;
	notContainer = null;
	notTween = null;
	yourContainer = null;
	yourTween = null;
	thoughtsContainer = null;
	thoughtsTween = null;
	descriptionContainer = null;
	descriptionTween = null;
	loginButtonContainer = null;
	registerButtonContainer = null;
	buttonTween = null;
	startState = { autoAlpha: 0, y: -1000 };
	bgImgContainer = null;
	bgImgTween = null;

	componentDidMount() {
		this.logoTween = new TimelineLite({ paused: true }).to(this.logoContainer, {
			duration: 2.5,
			y: 250,
			ease: 'power1.out',
			opacity: 1
		});
		this.logoTween.play();

		this.notTween = new TimelineLite({ paused: true }).to(this.notContainer, { duration: 2.6, x: 150, opacity: 1 });
		setTimeout(() => {
			this.notTween.play();
		}, 900);

		this.yourTween = new TimelineLite({ paused: true }).to(this.yourContainer, {
			duration: 2,
			y: -100,
			opacity: 1
		});
		setTimeout(() => {
			this.yourTween.play();
		}, 1200);

		this.thoughtsTween = new TimelineLite({ paused: true }).to(this.thoughtsContainer, {
			duration: 2,
			x: -100,
			opacity: 1
		});
		setTimeout(() => {
			this.thoughtsTween.play();
		}, 900);

		this.descriptionTween = new TimelineLite({ paused: true }).to(this.descriptionContainer, {
			duration: 2,
			y: -1,
			opacity: 1
		});
		setTimeout(() => {
			this.descriptionTween.play();
		}, 1500);

		this.loginButtonTween = new TimelineLite({ paused: true }).to(this.loginButtonContainer, {
			duration: 3,
			y: -1,
			ease: 'slow(0.7, 0.7, false)',
			opacity: 1
		});

		this.registerButtonTween = new TimelineLite({ paused: true }).to(this.registerButtonContainer, {
			duration: 3,
			y: -1,
			ease: 'slow(0.7, 0.7, false)',
			opacity: 1
		});

		setTimeout(() => {
			this.loginButtonTween.play();
			this.registerButtonTween.play();
		}, 4000);

		this.allTween = new TimelineLite({ paused: true }).to(this.allContainer, {
			duration: 3.5,
			y: -100,
			opacity: 1
		});
		setTimeout(() => {
			this.allTween.play();
		}, 3000);

		this.bgImgTween = new TimelineLite({ paused: true }).to(this.bgImgContainer, { duration: 2, opacity: 0.35 });

		setTimeout(() => {
			this.logoTween.reverse();
		}, 3100);
		setTimeout(() => {
			this.bgImgTween.play();
		}, 3500);
		setTimeout(() => {
			this.bgImgTween.reverse();
		}, 6500);
	}
	render() {
		return (
			<div ref={(div) => (this.allContainer = div)} className="landing">
				<img
					ref={(img) => (this.bgImgContainer = img)}
					className="landing__bg-img"
					src={bgOverlayTextureWhite}
					alt="background"
				></img>

				<h2 ref={(img) => (this.logoContainer = img)} className="landing__you-are">
					You are
				</h2>
				<h1 className="landing__title">
					<div className="landing__title-not" ref={(h1) => (this.notContainer = h1)}>
						Not
					</div>
					<div className="landing__title-your" ref={(h1) => (this.yourContainer = h1)}>
						Your{' '}
					</div>
					<div className="landing__title-thoughts" ref={(h1) => (this.thoughtsContainer = h1)}>
						Thoughts{' '}
					</div>
				</h1>
				<div className="landing__description-container">
					<p ref={(p) => (this.descriptionContainer = p)} className="landing__description">
						Not Your Thoughts is a mindfulness-based gamified journaling website dedicated to empowering the
						average human to develop a healthy relationship with the whirlwind of thoughts they find
						themselves inside daily. Through a consistent daily journaling practice and engagement with
						mindfulness prompts, the user will unlock new modes, features, and achievements as they progress
						towards the solidification of their practice.
					</p>
				</div>
				<div className="landing__all-buttons-container">
					<button
						ref={(button) => (this.loginButtonContainer = button)}
						className="landing__start-button-container"
					>
						<Link to="/login" className="landing__login-button">
							Login
						</Link>
					</button>
					<button
						ref={(button) => (this.registerButtonContainer = button)}
						className="landing__start-button-container"
					>
						<Link to="/register" className="landing__register-button">
							Register
						</Link>
					</button>
				</div>
			</div>
		);
	}
}
