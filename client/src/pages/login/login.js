import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../redux/actions/authActions';
import './login-register.scss';

const Login = ({ login, isAuthenticated, alert }) => {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});

	if (isAuthenticated) {
		return <Redirect to="/main" />;
	}
	const { email, password } = formData;

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
				<div className="login-register__input-container">
					<input
						className="login-register__input"
						type="email"
						placeholder="Email "
						name="email"
						value={email}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<div className="login-register__input-container">
					<input
						className="login-register__input"
						type="password"
						placeholder="Password"
						name="password"
						value={password}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<input
					type="submit"
					className="login-register__submit-button login-register__login-button "
					value="Login"
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
