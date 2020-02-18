import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../redux/actions/authActions';
import './login.scss';

const Login = ({ login, isAuthenticated, alert }) => {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});

	//it seems like this isAuthenticated stuff is actually running before we ever get to the main thing

	if (isAuthenticated) {
		return <Redirect to="/profile" />;
	}
	const { email, password } = formData;

	const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		login(email, password);
	};

	return (
		<div className="login">
			<h1 className="login__title">Login</h1>
			<h2 className={`login__alert  ${alert.length > 0 ? 'login__alert-open' : 'login__alert-closed'}`}>
				{alert[0] && alert[0].msg}
			</h2>
			<form className="login__form" onSubmit={(e) => onSubmit(e)}>
				<div className="login__input-container">
					<input
						className="login__input"
						type="email"
						placeholder="Email Address"
						name="email"
						value={email}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<div className="login__input-container">
					<input
						className="login__input"
						type="password"
						placeholder="Password"
						name="password"
						value={password}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<input type="submit" className="login__submit-button" value="Login" />
			</form>
			<p className="login__signup">
				Don't have an account?
				<Link className="login__signup-link" to="/register">
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
