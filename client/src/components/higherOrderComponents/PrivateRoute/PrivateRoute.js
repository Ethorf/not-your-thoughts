import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { loadUser } from '../../../redux/actions/authActions'
import Spinner from '../../Shared/Spinner/Spinner'

const PrivateRoute = ({ component: Component, auth: { isAuthenticated, user, token }, loadUser, ...rest }) => {
  useEffect(() => {
    if (token && !user) {
      loadUser()
    }
  }, [token, user, loadUser])

  // No token: not logged in
  if (!token) {
    return <Redirect to="/login" />
  }

  // Token exists but user not loaded yet: restoring session (e.g. after refresh)
  if (!user) {
    return <Spinner />
  }

  return <Route {...rest} render={(props) => (isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />)} />
}

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
  component: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
})

export default connect(mapStateToProps, { loadUser })(PrivateRoute)
