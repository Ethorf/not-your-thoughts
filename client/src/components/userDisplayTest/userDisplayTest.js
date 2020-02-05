import React, { Fragment, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logout } from '../../redux/actions/authActions';

// import { getCurrentProfile, deleteAccount } from '../../actions/profile';
const allStyle = {
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    flexDirection:"column"
}
const UserDisplayTest = ({isAuthenticated,auth:{ user }, logout}) => {

    if (!isAuthenticated) {
        return <Redirect to='/login' />;
      }
  
  return  (
        <div style={allStyle}>
            <h1 className='large text-primary'>User Display Test</h1>
            <div className='lead'>
                <i className='fas fa-user' /> Welcome {user && user.name}
                <h2>{user && user.consecutiveDays}</h2>
                <button className="logout__button" onClick={logout}>Logout</button>
            </div>
        </div>
  );
};

UserDisplayTest.propTypes = {
  auth: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool


};

const mapStateToProps = state => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated

});

export default connect(
  mapStateToProps,
  { logout }
)(UserDisplayTest);
