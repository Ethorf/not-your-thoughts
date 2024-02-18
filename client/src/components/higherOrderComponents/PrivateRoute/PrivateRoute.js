import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { loadUser } from '../../../redux/actions/authActions'

const PrivateRoute = ({ component: Component, auth: { isAuthenticated, user }, loadUser, ...rest }) => {
  useEffect(() => {
    if (!user) {
      loadUser()
    }
  }, [user, loadUser])

  return (
    <Route {...rest} render={(props) => (!isAuthenticated ? <Redirect to="/login" /> : <Component {...props} />)} />
  )
}

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
  component: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
})

export default connect(mapStateToProps, { loadUser })(PrivateRoute)
