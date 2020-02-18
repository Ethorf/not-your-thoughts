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

//do I really need to destructure these dudes all of them in here or is that just over nugging?
//all of this destructuring stuff is confusing the shit outta me

// dongle dingle. I did it!! celebrate the small stuff nug boiz. It aint gon last fo snevver.
// crispy tonions. So basically the biggest problem I was having was just the
//infinite entries.entries.entries.entries bullshit brought on by the reducer / root reducer madness
// my delete entry was essentially not working at all to update the state
//I didn't even notice that was happening because the error jazz  within the redux portion
//was not having a time at all though I should have known something was up with the
//entries error dispatchulous
//YAYAY
const Profile = ({
	loading,
	goal,
	isAuthenticated,
	auth: { user },
	logout,
	deleteEntry,
	loadUser,
	getEntries,
	entries
}) => {
	useEffect(() => {
		getEntries();
	}, [getEntries]);
	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}
	console.log(entries);
	return (
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
					Total Days Completed:<div className="profile__day-number"> {user && user.totalDays}</div>
				</h2>
				<h2 className="profile__last-day">
					Last Day Completed:<div className="profile__day-number"> {user && user.lastDayCompleted}</div>
				</h2>
				<ProfileGoalEdit />
				<h2 className="profile__entries-header">SAVED ENtRIES</h2>
				{entries.length === 0 ? (
					<Spinner />
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
