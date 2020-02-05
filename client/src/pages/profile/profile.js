import React, { useEffect} from 'react';
import './profile.scss';
import '../../styles/mixins.scss'
import '../../styles/rubberDucky.scss'
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout } from '../../redux/actions/authActions';


const Profile =({isAuthenticated,auth:{ user }, logout})=>{

    if (!isAuthenticated) {
        return <Redirect to='/login' />;
      }
        return(
            <div className="profile">
                <div className="profile__content">
                    <header className="profile__header">User Profile</header>
                    <h2 className="profile__user">User: {user && user.name}</h2>
                    <h2 className="profile__consecutive-days">Consecutive Days Completed: {user && user.consecutiveDays}</h2>
                    <h2 className="profile__total-days">Total Days Completed: {user && user.totalDays}</h2>
                    <h2 className="profile__achievements-unlocked">Achievments Unlocked</h2>
                    <div className="profile__achievement-container">
                        <div className="profile__achievement-mode-container">
                            <h2 className="profile__rubber-ducky-requirement">3 Consecutive Days--->  </h2>
                            <h2 className={`profile__rubber-ducky-title ${user && user.consecutiveDays >= 3 ? " " : "strikethrough"}`}>
                                 Rubber Ducky Mode</h2>
                            <button className={`profile__rubber-ducky-activate-button
                                                 ${user && user.consecutiveDays >= 3 ? " " : "rubberDucky__hidden"}`}>
                                                {/* {`${this.props.rubberDucky ? "Deactivate" : "Activate"}`} */}
                                                </button>
                        </div>
                        <div className="profile__achievement-mode-container">
                            <h2 className="profile__rubber-ducky-requirement">5 Consecutive Days--->  </h2>
                            <h2 className="profile__bullshittify-title"> Bullsh*tiffy Mode</h2>
                        </div>
                        <div className="profile__achievement-mode-container">
                            <h2 className="profile__rubber-ducky-requirement">7 Consecutive Days--->  </h2>
                            <h2 className="profile__rpg-title"> RPG Mode</h2>
                        </div>
                    </div>
                </div>
                <div className="profile__bottom-chunk"></div>    
            </div>
            
        )
    }

    Profile.propTypes = {
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
      )(Profile);
