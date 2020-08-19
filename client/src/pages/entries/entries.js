import React, { useEffect, useState } from 'react';
import '../profile/profile.scss';
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

const Entries = ({
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

	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}
	const SavedEntries = () => {
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
							pdEmotionAnalysis={userData.pdEmotionAnalysis}
						/>
					))
				)}
			</>
		);
	};
	return user === null ? (
		<Spinner />
	) : (
		<>
			<div className={`profile ${mode}`}>
				<div className="profile__content">
					<h2 className={`profile__entries-header ${mode}`}>SAVED ENtRIES</h2>
					{user === null ? <Spinner /> : <SavedEntries />}
				</div>
			</div>
		</>
	);
};

Entries.propTypes = {
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

export default connect(mapStateToProps, { logout, deleteEntry, loadUser, getEntries, toggleUserSetting })(Entries);