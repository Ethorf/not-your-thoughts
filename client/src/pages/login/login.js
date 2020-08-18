import React, { useState, useEffect, useRef } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../redux/actions/authActions';
import './login-register.scss';
import { gsap, TimelineMax } from 'gsap';
import FadeInAnimation from '../../components/higherOrderComponents/fadeInAnimation.js';

const Login = ({ login, isAuthenticated, alert }) => {
	let loginInputRef = useRef(null);
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});
	// const [loginInputAnimation, setloginInputAnimation] = useState(null);
	// const loginInputTl = new TimelineMax({ paused: true });
	// useEffect(() => {
	// 	mountAnimation();
	// }, []);

	if (isAuthenticated) {
		return <Redirect to="/main" />;
	}
	const { email, password } = formData;
	// const mountAnimation = () => {
	// 	setloginInputAnimation(
	// 		loginInputTl
	// 			.from(loginInputRef, { delay: 0.8, duration: 0.8, x: 100, opacity: 0.2, ease: 'power1.out' })
	// 			.to(loginInputRef, {
	// 				duration: 0.8,
	// 				x: -1,
	// 				opacity: 1,
	// 				ease: 'power1.out'
	// 			})
	// 			.play()
	// 	);
	// };

	const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		login(email, password);
	};

	return (
		<div className="login-register">
			<h1 className="login-register__title">Login</h1>
			<h2
				className={`login-register__alert  ${
					alert.length > 0 ? 'login-register__alert-open' : 'login-register__alert-closed'
				}`}
			>
				{alert[0] && alert[0].msg}
			</h2>
			<form className="login-register__form" onSubmit={(e) => onSubmit(e)}>
				<FadeInAnimation wrapperElement="div" direction="left">
					<div
						className="login-register__input-container"

						// ref={(div) => (loginInputRef = div)}
					>
						<input
							className="login-register__input"
							id="email-input"
							type="email"
							placeholder="Email "
							name="email"
							value={email}
							onChange={(e) => onChange(e)}
						/>
					</div>
				</FadeInAnimation>
				<FadeInAnimation wrapperElement="div" direction="right">
					<div className="login-register__input-container">
						<input
							className="login-register__input"
							id="password-input"
							type="password"
							placeholder="Password"
							name="password"
							value={password}
							onChange={(e) => onChange(e)}
						/>
					</div>
				</FadeInAnimation>

				<input
					type="submit"
					className="login-register__submit-button login-register__login-button "
					value="Login"
					id="login-submit-button"
				/>
			</form>
			<p className="login-register__signup">
				Don't have an account?
				<Link className="login-register__signup-link" to="/register">
					Sign Up
				</Link>
			</p>
		</div>
	);
};

Login.propTypes = {
	login: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
	alert: PropTypes.array
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
	alert: state.alert
});

export default connect(mapStateToProps, { login })(Login);
