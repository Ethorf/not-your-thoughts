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
  // Issues
  //  Looks like this user / null is preventing us from getting redirected to login but somehow loadUser isn't making isAuthenticated happen?
  // also looks like we have an issue with if we turn off the spinner below loading an edit entry is fucked
  // also turning off the spinner makes us like go through a whole other login chain again
  if (user === null) {
    return <Spinner />
  }

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
