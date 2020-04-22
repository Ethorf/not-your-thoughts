import React, { useEffect, useState } from 'react';
import './profile.scss';
import '../../styles/rubberDucky.scss';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout, loadUser, toggleProgressAudio } from '../../redux/actions/authActions';
import { deleteEntry, getEntries } from '../../redux/actions/entryActions.js';
import Entry from '../../components/entry/entry.js';
import ProfileGoalEdit from '../../components/profileGoalEdit/profileGoalEdit.js';
import CustomPrompts from '../../components/customPrompts/customPrompts.js';

import Spinner from '../../components/spinner/spinner.js';

const Profile = ({
	isAuthenticated,
	auth: { user },
	deleteEntry,
	getEntries,
	entries,
	mode,
	toggleProgressAudio,
	progressAudioEnabled
}) => {
	const [localProgressAudioEnabled, setLocalProgressAudioEnabled] = useState(progressAudioEnabled);
	useEffect(() => {
		loadUser();
		getEntries();
		if (user !== null) {
			setLocalProgressAudioEnabled(user.progressAudioEnabled);
		}
	}, [getEntries]);

	const toggleLocalProgressAudio = () => {
		setLocalProgressAudioEnabled(!localProgressAudioEnabled);
		toggleProgressAudio();
	};

	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}
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
				<h2 className={`profile__user ${mode}`}>{user && user.name}</h2>

				{user.lastDayCompleted !== null ? (
					<>
						<div className={`profile__stats-container ${mode}`}>
							<h2 className="profile__stats-text">
								Consecutive Days Completed:
								<span className={`profile__day-number ${mode}`}> {user && user.consecutiveDays}</span>
							</h2>
							<h2 className="profile__total-days profile__stats-text">
								Total Days Completed:
								<span className={`profile__day-number ${mode}`}> {user.totalDays}</span>
							</h2>
						</div>
						<div className={`profile__stats-container ${mode}`}>
							<h2 className="profile__stats-text">
								Last Day Completed:
								<span className={`profile__day-number ${mode}`}> {user.lastDayCompleted}</span>
							</h2>
							<ProfileGoalEdit />
						</div>
					</>
				) : (
					<h2 className={`profile__day-number profile__no-days  ${mode}`}>No days complete yet</h2>
				)}

				<div className={`profile__toggle-container`}>
					Progress Audio:
					<div onClick={toggleLocalProgressAudio} className={`profile__toggle-switch`}>
						<span
							className={` profile__toggle-button profile__on-button ${
								localProgressAudioEnabled ? 'profile__active' : 'profile__inactive'
							}`}
						>
							On
						</span>
						<span
							className={` profile__toggle-button profile__off-button ${
								localProgressAudioEnabled ? 'profile__inactive' : 'profile__active'
							}`}
						>
							Off
						</span>{' '}
					</div>
				</div>
				<CustomPrompts />
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

export default connect(mapStateToProps, { logout, deleteEntry, loadUser, getEntries, toggleProgressAudio })(Profile);
