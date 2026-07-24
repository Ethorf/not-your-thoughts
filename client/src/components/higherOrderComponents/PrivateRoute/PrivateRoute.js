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

  // Always render a Route so Switch can match this path correctly.
  // Early Redirect/Spinner returns (without Route) can fall through to other routes.
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!token) {
          return <Redirect to="/login" />
        }

        if (!user) {
          return <Spinner />
        }

        if (!isAuthenticated) {
          return <Redirect to="/login" />
        }

        return <Component {...props} />
      }}
    />
  )
}

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
  component: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
})

export default connect(mapStateToProps, { loadUser })(PrivateRoute)
