import React from 'react';
import { connect } from 'react-redux';
import { toggleEditGoal, changeGoal, setNewGoal } from '../../redux/actions/index';
import '../../pages/profile/profile.scss';

function ProfileGoalEdit({
	newGoal,
	goal,
	toggleEditGoal,
	goalIsEditable,
	changeGoal,
	setNewGoal,
	mode,
	auth: { user }
}) {
	const goalNum = (e) => {
		e.preventDefault();
		setNewGoal(e.target.value);
	};

	const saveGoal = () => {
		changeGoal(newGoal);
		toggleEditGoal();
	};

	const cancelEditGoal = () => {
		toggleEditGoal();
	};
	return goalIsEditable ? (
		<div className="profile__goal-edit">
			<h2 className="profile__stats-text ">Daily Words Goal :</h2>
			<input
				className={`profile__goal-input ${mode}`}
				onChange={goalNum}
				defaultValue={user.dailyWordsGoal}
			></input>
			<button onClick={saveGoal} className="profile__goal-edit-button">
				Save
			</button>
			<button onClick={cancelEditGoal} className="profile__goal-edit-button profile__goal-cancel-button">
				Cancel
			</button>
		</div>
	) : (
		<div className="profile__goal-edit">
			<h2 className="profile__stats-text ">Daily Words Goal :</h2>
			<div className={`profile__day-number ${mode}`}> {user.dailyWordsGoal}</div>
			<button onClick={toggleEditGoal} className="profile__goal-edit-button">
				Edit
			</button>
		</div>
	);
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	isAuthenticated: state.auth.isAuthenticated,
	goal: state.wordCount.goal,
	newGoal: state.wordCount.newGoal,
	goalIsEditable: state.wordCount.goalIsEditable,
	mode: state.modes.mode
});
export default connect(mapStateToProps, { toggleEditGoal, changeGoal, setNewGoal })(ProfileGoalEdit);
