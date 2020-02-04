import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { getCurrentProfile, deleteAccount } from '../../actions/profile';

const UserDisplayTest = ({auth:{ user }}) => {
  
//   useEffect(() => {
//         getCurrentProfile();
//     }, [getCurrentProfile]);

  return  (
   
    <Fragment>
      <h1 className='large text-primary'>User Display Test</h1>
      <p className='lead'>
        <i className='fas fa-user' /> Welcome {user && user.name}
        <p>{user && user.consecutiveDays}</p>
      </p>
    </Fragment>
  );
};

UserDisplayTest.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(
  mapStateToProps,
  { }
)(UserDisplayTest);
