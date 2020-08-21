import React, { useEffect, useState } from 'react';
import './profile.scss';
import '../../styles/rubberDucky.scss';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout, loadUser, toggleUserSetting } from '../../redux/actions/authActions';
import { deleteEntry, getEntries } from '../../redux/actions/entryActions.js';
import ProfileGoalEdit from '../../components/profileGoalEdit/profileGoalEdit.js';
import TrackedPhrasesModal from '../../components/Modals/trackedPhrasesModal.js';
import CustomPrompts from '../../components/customPrompts/customPrompts.js';

import Spinner from '../../components/spinner/spinner.js';

const Profile = ({
	isAuthenticated,
	auth: { user },
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
		if (user !== null) {
			setLocalProgressAudioEnabled(user.progressAudioEnabled);
			setLocalTimerEnabled(user.timerEnabled);
			setLocalWpmEnabled(user.wpmEnabled);
		}
	}, []);

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
	return user === null ? (
		<Spinner />
	) : (
		<div className={`profile ${mode}`}>
			<div className="profile__content">
				<header className={`profile__header ${mode}`}>User Profile</header>
				<h2 className={`profile__user ${mode}`}>{user && user.name}</h2>
				<h2 className={`profile__sub-header ${mode}`}>Stats</h2>

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
							<h2 className={`profile__sub-header ${mode}`}>Settings</h2>
							<ProfileGoalEdit />
						</div>
						<div className={`profile__toggle-container`}>
							Tracked Phrases:
							<TrackedPhrasesModal />
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

				<CustomPrompts />
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
