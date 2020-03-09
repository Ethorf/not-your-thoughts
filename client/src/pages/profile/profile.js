import React, { useEffect } from 'react';
import './profile.scss';
import '../../styles/rubberDucky.scss';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout, loadUser } from '../../redux/actions/authActions';
import { deleteEntry, getEntries } from '../../redux/actions/entryActions.js';
import Entry from '../../components/entry/entry.js';
import ProfileGoalEdit from '../../components/profileGoalEdit/profileGoalEdit.js';
import Spinner from '../../components/spinner/spinner.js';

const Profile = ({ isAuthenticated, auth: { user }, deleteEntry, getEntries, entries, mode }) => {
	useEffect(() => {
		loadUser();
		getEntries();
	}, [getEntries, loadUser]);

	// if (!isAuthenticated) {
	// 	return <Redirect to="/login" />;
	// }
	const Entries = () => {
		return (
			<>
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
			</>
		);
	};

	return user === null ? (
		<Spinner />
	) : (
		<div className={`profile ${mode}`}>
			<div className="profile__content">
				<header className={`profile__header ${mode}`}>User Profile</header>
				<div className="profile__user-logout-container">
					<h2 className={`profile__user ${mode}`}>{user && user.name}</h2>
				</div>
				<h2 className="profile__consecutive-days profile__stats-text">
					Consecutive Days Completed:
					<div className={`profile__day-number ${mode}`}> {user && user.consecutiveDays}</div>
				</h2>
				<h2 className="profile__total-days profile__stats-text">
					Total Days Completed:<div className={`profile__day-number ${mode}`}> {user.totalDays}</div>
				</h2>
				{user.lastDayCompleted !== null ? (
					<h2 className="profile__last-day profile__stats-text">
						Last Day Completed:<div className={`profile__day-number ${mode}`}> {user.lastDayCompleted}</div>
					</h2>
				) : (
					<h2 className={`profile__day-number ${mode}`}>No days complete yet</h2>
				)}

				<ProfileGoalEdit />
				<h2 className={`profile__entries-header ${mode}`}>SAVED ENtRIES</h2>
				{user === null ? <Spinner /> : <Entries />}
			</div>
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
	loading: state.entries,
	mode: state.modes.mode
});

export default connect(mapStateToProps, { logout, deleteEntry, loadUser, getEntries })(Profile);
