import React, { useState } from 'react'
import { Link, Redirect, useHistory } from 'react-router-dom'
import { connect, useDispatch } from 'react-redux'
import classNames from 'classnames'
import PropTypes from 'prop-types'

// Redux
import { fetchJournalConfig } from '@redux/reducers/journalEntriesReducer.js'
import { fetchCustomPrompts } from '@redux/reducers/customPromptsReducer'

import { login, toggleGuestMode } from '@redux/actions/authActions.js'

import { showToast } from '@utils/toast.js'

import sharedStyles from '@styles/sharedClassnames.module.scss'
import styles from './LoginPage.module.scss'
import './LoginPage-RegisterPage.scss'

import FadeInAnimationOnMount from '@components/higherOrderComponents/fadeInAnimationOnMount.js'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton.js'

const Login = ({ login, isAuthenticated, alert, toggleGuestMode, guestMode }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()

    if (guestMode) toggleGuestMode()

    if (email && password) {
      let loginResponse = await login(email, password)

      if (loginResponse.jwtToken) {
        console.log('yes there is a token')
        await dispatch(fetchJournalConfig())
        await dispatch(fetchCustomPrompts())
        history.push('/dashboard')
      }

      if (loginResponse.code) {
        loginResponse.code == 'ERR_BAD_RESPONSE'
          ? showToast('server error, connection failed', 'error')
          : showToast('invalid username or password', 'warn')
      }
    } else {
      showToast('please enter an email and a password', 'warn')
    }
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />
  }

  return (
    <div className="login-register">
      <FadeInAnimationOnMount wrapperElement="div" direction="down">
        <h1 className={classNames(sharedStyles.title, styles.loginHeader)}>Login</h1>
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
          <DefaultButton>Login</DefaultButton>
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
