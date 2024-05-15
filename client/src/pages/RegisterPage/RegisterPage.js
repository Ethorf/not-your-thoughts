import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import { setAlert } from '../../redux/actions/alert.js'
import { register, resetAuthMessages, toggleGuestMode } from '../../redux/actions/authActions.js'
import { useSelector, useDispatch } from 'react-redux'
import { showToast } from '@utils/toast.js'
import PropTypes from 'prop-types'
import './RegisterPage.scss'
import '../LoginPage/LoginPage-RegisterPage.scss'
import FadeInAnimationOnMount from '../../components/higherOrderComponents/fadeInAnimationOnMount.js'

const Register = ({ setAlert, register, isAuthenticated, alert, guestMode, toggleGuestMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  })

  const dispatch = useDispatch()
  const message = useSelector(state => state.auth.message)
  const error = useSelector(state => state.auth.error)

  const { name, email, password, password2 } = formData

  // listen for errors from our server and display them, then reset in
  useEffect(()=>{
    if (error) {
      showToast(error, 'warn')
      resetAuthMessages(dispatch)
    }
  }, [error])

  // listen to messages from our server and display them, then reset it
  useEffect(()=>{
    if (message) {
      showToast(message, 'success')
      resetAuthMessages(dispatch)
    }
  }, [message])

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !password2 )
      showToast('All fields are required', 'warn')
    else if (password !== password2) 
      showToast('Passwords do not match', 'warn')
    else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name))
      showToast('Username must contain only letters and numbers', 'warn')
    else if (!/^\S+@\S+\.\S+$/.test(email))
      showToast('Please enter a valid email', 'warn')
    // passed validation
    else {
      register({ name, email, password })
    }
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />
  }

  return (
    <div className="login-register">
      <FadeInAnimationOnMount wrapperElement="div" direction="down">
        <h1 className="login-register__title">Sign Up</h1>
      </FadeInAnimationOnMount>

      <h2 className={`login__alert  ${alert.length > 0 ? 'login__alert-open' : 'login__alert-closed'}`}>
        {alert[0] && alert[0].msg}
      </h2>
      <form className="login-register__form" onSubmit={(e) => onSubmit(e)}>
        <FadeInAnimationOnMount wrapperElement="div" direction="left">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={(e) => onChange(e)}
            className="login-register__input"
          />
        </FadeInAnimationOnMount>
        <FadeInAnimationOnMount wrapperElement="div" direction="right">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={(e) => onChange(e)}
            className="login-register__input"
          />
        </FadeInAnimationOnMount>
        <FadeInAnimationOnMount wrapperElement="div" direction="left">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => onChange(e)}
            className="login-register__input"
          />
        </FadeInAnimationOnMount>
        <FadeInAnimationOnMount wrapperElement="div" direction="right">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange={(e) => onChange(e)}
            className="login-register__input"
          />
        </FadeInAnimationOnMount>
        <FadeInAnimationOnMount wrapperElement="div" direction="up">
          <input
            type="submit"
            className="login-register__submit-button login-register__register-button"
            value="Register"
          />
        </FadeInAnimationOnMount>
      </form>
      <FadeInAnimationOnMount wrapperElement="div" direction="up">
        <div className="login-register__signup">
          Already have an account?
          <br />
          <div>
            <Link className="login-register__signup-link" to="/login">
              Login
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

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  alert: state.alert,
  guestMode: state.auth.guestMode,
})

export default connect(mapStateToProps, { setAlert, register, toggleGuestMode })(Register)
