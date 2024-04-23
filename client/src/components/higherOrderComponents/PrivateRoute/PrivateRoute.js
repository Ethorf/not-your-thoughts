import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { loadUser } from '../../../redux/actions/authActions'
import Spinner from '../../Shared/Spinner/Spinner'

const PrivateRoute = ({ component: Component, auth: { isAuthenticated, user }, loadUser, ...rest }) => {
  useEffect(() => {
    if (!user) {
      loadUser()
    }
  }, [user, loadUser])

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }
  if (user === null) {
    return <Spinner />
  }

  return (
    <Route {...rest} render={(props) => (!isAuthenticated ? <Redirect to="/login" /> : <Component {...props} />)} />
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
