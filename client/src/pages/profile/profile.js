import React, { useEffect, useState } from 'react';
import './profile.scss';
import '../../styles/rubberDucky.scss';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout, loadUser, toggleUserSetting } from '../../redux/actions/authActions';
import { deleteEntry, getEntries } from '../../redux/actions/entryActions.js';
import Entry from '../../components/entry/entry.js';
import ProfileGoalEdit from '../../components/profileGoalEdit/profileGoalEdit.js';
import TrackedPhrasesModal from '../../components/Modals/trackedPhrasesModal.js';
import CustomPrompts from '../../components/customPrompts/customPrompts.js';

import Spinner from '../../components/spinner/spinner.js';

const Profile = ({
	isAuthenticated,
	auth: { user },
	deleteEntry,
	getEntries,
	entries,
	mode,
	toggleUserSetting,
	progressAudioEnabled,
	timerEnabled,
	wpmEnabled
}) => {
	const [localProgressAudioEnabled, setLocalProgressAudioEnabled] = useState(progressAudioEnabled);
	const [localTimerEnabled, setLocalTimerEnabled] = useState(timerEnabled);
	const [localWpmEnabled, setLocalWpmEnabled] = useState(wpmEnabled);

	useEffect(() => {
		loadUser();
		getEntries();
		if (user !== null) {
			setLocalProgressAudioEnabled(user.progressAudioEnabled);
			setLocalTimerEnabled(user.timerEnabled);
			setLocalWpmEnabled(user.wpmEnabled);
		}
	}, [getEntries]);

	//Could I make this into a functional thing? might as well try

	const toggleLocalProgressAudio = () => {
		setLocalProgressAudioEnabled(!localProgressAudioEnabled);
		toggleUserSetting('Audio');
	};
	const toggleLocalTimer = () => {
		setLocalTimerEnabled(!localTimerEnabled);
		toggleUserSetting('Timer');
	};
	const toggleLocalWpm = () => {
		setLocalWpmEnabled(!localWpmEnabled);
		toggleUserSetting('Wpm');
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
					entries.map((userData) => (
						<Entry
							key={userData.id}
							id={userData.id}
							className="profile profile__entry"
							wordCount={userData.numOfWords}
							date={userData.date}
							timeElapsed={userData.timeElapsed}
							wpm={userData.wpm}
							content={userData.content}
							deleteEntry={deleteEntry}
							getEntries={getEntries}
							trackedPhrases={user.trackedPhrases}
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

				<div className={`profile__toggle-container`}>
					Timer:
					<div onClick={toggleLocalTimer} className={`profile__toggle-switch`}>
						<span
							className={` profile__toggle-button profile__on-button ${
								localTimerEnabled ? 'profile__active' : 'profile__inactive'
							}`}
						>
							On
						</span>
						<span
							className={` profile__toggle-button profile__off-button ${
								localTimerEnabled ? 'profile__inactive' : 'profile__active'
							}`}
						>
							Off
						</span>{' '}
					</div>
				</div>

				<div className={`profile__toggle-container`}>
					WPM readout:
					<div onClick={toggleLocalWpm} className={`profile__toggle-switch`}>
						<span
							className={` profile__toggle-button profile__on-button ${
								localWpmEnabled ? 'profile__active' : 'profile__inactive'
							}`}
						>
							On
						</span>
						<span
							className={` profile__toggle-button profile__off-button ${
								localWpmEnabled ? 'profile__inactive' : 'profile__active'
							}`}
						>
							Off
						</span>{' '}
					</div>
				</div>

				<div className={`profile__toggle-container`}>
					Tracked Phrases
					<TrackedPhrasesModal />
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

export default connect(mapStateToProps, { logout, deleteEntry, loadUser, getEntries, toggleUserSetting })(Profile);
