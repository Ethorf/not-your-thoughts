import React, { useEffect, Fragment, Component } from 'react';
import './profile.scss';
import '../../styles/mixins.scss';
import '../../styles/rubberDucky.scss';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout, loadUser } from '../../redux/actions/authActions';
import { deleteEntry, getEntries } from '../../redux/actions/entryActions.js';
import Entry from '../../components/entry/entry.js';
import moment from 'moment';
import ProfileGoalEdit from '../../components/profileGoalEdit/profileGoalEdit.js';
import Spinner from '../../components/spinner/spinner.js';

const Profile = ({
	isAuthenticated,
	auth: { user },
	logout,
	deleteEntry,
	getEntries,
	entries,
	totalDays,
	consecutiveDays
}) => {
	useEffect(() => {
		loadUser();
		getEntries();
	}, [getEntries, loadUser]);
	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}

	return user === null ? (
		<h1>Loading..</h1>
	) : (
		<div className="profile">
			<div className="profile__content">
				<header className="profile__header">User Profile</header>
				<div className="profile__user-logout-container">
					<h2 className="profile__user">{user && user.name}</h2>
				</div>
				<h2 className="profile__consecutive-days">
					Consecutive Days Completed:
					<div className="profile__day-number"> {user && user.consecutiveDays}</div>
				</h2>
				<h2 className="profile__total-days">
					Total Days Completed:<div className="profile__day-number"> {user.totalDays}</div>
				</h2>
				{user.lastDayCompleted !== null ? (
					<h2 className="profile__last-day">
						Last Day Completed:<div className="profile__day-number"> {user.lastDayCompleted}</div>
					</h2>
				) : (
					<h2 className="profile__last-day">No days complete yet</h2>
				)}

				<ProfileGoalEdit />
				<h2 className="profile__entries-header">SAVED ENtRIES</h2>
				{entries.length === 0 ? (
					<h2>You have no saved journal entries</h2>
				) : (
					entries.map((user) => (
						<Entry
							key={user.id}
							id={user.id}
							className="profile profile__entry"
							wordCount={user.numOfWords}
							date={user.date}
							content={user.content}
							deleteEntry={deleteEntry}
							getEntries={getEntries}
						/>
					))
				)}
			</div>
			<button onClick={logout} className="profile__logout-button">
				Logout
			</button>
		</div>
	);
};

Profile.propTypes = {
	auth: PropTypes.object.isRequired,
	logout: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
	getEntries: PropTypes.func.isRequired,
	entries: PropTypes.array.isRequired
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	isAuthenticated: state.auth.isAuthenticated,
	goal: state.wordCount.goal,
	entries: state.entries.entries,
	loading: state.entries
});

export default connect(mapStateToProps, { logout, deleteEntry, loadUser, getEntries })(Profile);
