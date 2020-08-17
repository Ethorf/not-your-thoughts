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
	youareContainer = null;
	youareTween = null;
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

	yourAnimSize = () => {
		let y = 0;
		console.log(window.innerWidth);
		if (window.innerWidth <= 767) {
			y = '-15vh';
		} else {
			y = '-131%';
		}
		return y;
	};
	componentDidMount() {
		this.youareTween = new TimelineLite({ paused: true })
			.from(this.youareContainer, {
				duration: 2.5,
				y: '-200px',
				ease: 'power1.out',
				opacity: 0
			})
			.to(this.youareContainer, {
				duration: 2.5,
				y: '0',
				ease: 'power1.out',
				opacity: 1
			});
		this.youareTween.play();
		this.notTween = new TimelineLite({ paused: true })
			.from(this.notContainer, {
				duration: 2.6,
				x: '-8vw',
				opacity: 0
			})
			.to(this.notContainer, {
				duration: 2.6,
				x: '0',
				opacity: 1
			});
		setTimeout(() => {
			this.notTween.play();
		}, 900);
		this.yourTween = new TimelineLite({ paused: true })
			.from(this.yourContainer, {
				duration: 2,
				// y: `-${this.yourAnimSize()}`,
				y: '150px',
				opacity: 0
			})
			.to(this.yourContainer, {
				duration: 2,
				y: 0,
				opacity: 1
			});
		setTimeout(() => {
			this.yourTween.play();
		}, 1000);
		this.thoughtsTween = new TimelineLite({ paused: true })
			.from(this.thoughtsContainer, {
				duration: 2,
				x: '6vw',
				opacity: 0
			})
			.to(this.thoughtsContainer, {
				duration: 2,
				x: 0,
				opacity: 1
			});
		setTimeout(() => {
			this.thoughtsTween.play();
		}, 900);
		this.descriptionTween = new TimelineLite({ paused: true })
			.from(this.descriptionContainer, {
				duration: 2,
				y: -1,
				opacity: 0
			})
			.to(this.descriptionContainer, {
				duration: 2,
				y: 0,
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
			y: -130,
			opacity: 1
		});
		setTimeout(() => {
			this.allTween.play();
		}, 3000);
		this.bgImgTween = new TimelineLite({ paused: true }).to(this.bgImgContainer, { duration: 2, opacity: 0.25 });
		setTimeout(() => {
			this.youareTween.reverse();
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

				<h2 ref={(img) => (this.youareContainer = img)} className="landing__you-are">
					You are
				</h2>
				<h1 className="landing__title">
					<div className="landing__title-text" ref={(h1) => (this.notContainer = h1)}>
						Not
					</div>
					<div className="landing__title-text" ref={(h1) => (this.yourContainer = h1)}>
						Your{' '}
					</div>
					<div className="landing__title-text" ref={(h1) => (this.thoughtsContainer = h1)}>
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
					<Link
						ref={(button) => (this.loginButtonContainer = button)}
						to="/login"
						className="landing__login-button"
					>
						Login
					</Link>

					<Link
						ref={(button) => (this.registerButtonContainer = button)}
						to="/register"
						className="landing__register-button"
					>
						Register
					</Link>
				</div>
			</div>
		);
	}
}
