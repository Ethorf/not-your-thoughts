import React, { useEffect, Fragment, Component } from 'react';
import './profile.scss';
import '../../styles/mixins.scss';
import '../../styles/rubberDucky.scss';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout, loadUser } from '../../redux/actions/authActions';
import Entry from '../../components/entry/entry.js';
import moment from 'moment';

const Profile = ({ isAuthenticated, auth: { user }, logout }) => {
	loadUser();

	function entArr() {
		let entArrData = user.entries;
		return (
			<div>
				{entArrData.map((user) => (
					<Entry
						key={user.id}
						className="profile profile__entry"
						wordCount={user.numOfWords}
						date={user.date}
						content={user.content}
					/>
				))}
			</div>
		);
	}
	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}
	return (
		<div className="profile">
			<div className="profile__content">
				<header className="profile__header">User Profile</header>
				<div className="profile__user-logout-container">
					<h2 className="profile__user">{user.name}</h2>
					<button onClick={logout} className="profile__logout-button">
						Logout
					</button>
				</div>
				<h2 className="profile__consecutive-days">
					Consecutive Days Completed:<div className="profile__day-number"> {user.consecutiveDays}</div>
				</h2>
				<h2 className="profile__total-days">
					Total Days Completed:<div className="profile__day-number"> {user.totalDays}</div>
				</h2>
				<h2 className="profile__last-day">
					Last Day Completed:<div className="profile__day-number"> {user.lastDayCompleted}</div>
				</h2>
				<h2 className="profile__entries-header">SAVED ENtRIES</h2>
				{entArr()}
			</div>
		</div>
	);
};

Profile.propTypes = {
	auth: PropTypes.object.isRequired,
	logout: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { logout })(Profile);
