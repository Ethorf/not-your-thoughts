import React, { useState } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { login, toggleGuestMode } from '../../redux/actions/authActions.js'
import './login-register.scss'
import FadeInAnimationOnMount from '../../components/higherOrderComponents/fadeInAnimationOnMount.js'

const Login = ({ login, isAuthenticated, alert, toggleGuestMode, guestMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()

    if (guestMode) toggleGuestMode()
    login(email, password)
  }

  if (isAuthenticated) {
    return <Redirect to="/main" />
  }

  return (
    <div className="login-register">
      <FadeInAnimationOnMount wrapperElement="div" direction="down">
        <h1 className="login-register__title">Login</h1>
      </FadeInAnimationOnMount>
      <h2
        className={`login-register__alert  ${
          alert.length > 0 ? 'login-register__alert-open' : 'login-register__alert-closed'
        }`}
      >
        {alert[0] && alert[0].msg}
      </h2>
      <form className="login-register__form" onSubmit={(e) => onSubmit(e)}>
        <FadeInAnimationOnMount wrapperElement="div" direction="left">
          <div className="login-register__input-container">
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
        </FadeInAnimationOnMount>
        <FadeInAnimationOnMount wrapperElement="div" direction="right">
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
        </FadeInAnimationOnMount>
        <FadeInAnimationOnMount wrapperElement="div" direction="up">
          <input
            type="submit"
            className="login-register__submit-button login-register__login-button "
            value="Login"
            id="login-submit-button"
          />
        </FadeInAnimationOnMount>
      </form>
      <FadeInAnimationOnMount wrapperElement="div" direction="up">
        <div className="login-register__signup">
          Don't have an account?
          <br />
          <div>
            <Link className="login-register__signup-link" to="/register">
              Sign Up
            </Link>{' '}
            or give{''}
            <Link className="login-register__signup-link" to="/main" onClick={toggleGuestMode}>
              Guest Mode
            </Link>{' '}
            a try!
          </div>
        </div>
      </FadeInAnimationOnMount>
    </div>
  )
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  alert: PropTypes.array,
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  alert: state.alert,
  guestMode: state.auth.guestMode,
})

export default connect(mapStateToProps, { login, toggleGuestMode })(Login)
