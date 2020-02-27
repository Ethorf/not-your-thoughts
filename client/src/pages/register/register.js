import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { setAlert } from '../../redux/actions/alert';
import { register } from '../../redux/actions/authActions';
import PropTypes from 'prop-types';
import './register.scss';
import '../login/login-register.scss';

const Register = ({ setAlert, register, isAuthenticated, alert }) => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		password2: ''
	});

	const { name, email, password, password2 } = formData;

	const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		if (password !== password2) {
			setAlert('Passwords do not match', 'danger');
		} else {
			register({ name, email, password });
		}
	};

	if (isAuthenticated) {
		return <Redirect to="/main" />;
	}

	return (
		<div className="login-register">
			<h1 className="login-register__title">Sign Up</h1>
			<h2 className={`login__alert  ${alert.length > 0 ? 'login__alert-open' : 'login__alert-closed'}`}>
				{alert[0] && alert[0].msg}
			</h2>
			<form className="login-register__form" onSubmit={(e) => onSubmit(e)}>
				<input
					type="text"
					placeholder="Name"
					name="name"
					value={name}
					onChange={(e) => onChange(e)}
					className="login-register__input"
				/>
				<input
					type="email"
					placeholder="Email Address"
					name="email"
					value={email}
					onChange={(e) => onChange(e)}
					className="login-register__input"
				/>
				<input
					type="password"
					placeholder="Password"
					name="password"
					value={password}
					onChange={(e) => onChange(e)}
					className="login-register__input"
				/>
				<input
					type="password"
					placeholder="Confirm Password"
					name="password2"
					value={password2}
					onChange={(e) => onChange(e)}
					className="login-register__input"
				/>
				<input type="submit" className="login-register__submit-button" value="Register" />
			</form>
			<p className="login-register__signup">
				Already have an account?{' '}
				<Link to="/login" className="login-register__signup-link">
					Sign In
				</Link>
			</p>
		</div>
	);
};

Register.propTypes = {
	setAlert: PropTypes.func.isRequired,
	register: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
	alert: state.alert
});

export default connect(mapStateToProps, { setAlert, register })(Register);
