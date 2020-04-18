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
		<h2 className="profile__stats-text profile__goal-edit-container">
			Daily Words Goal :
			<input
				className={`profile__goal-input ${mode}`}
				onChange={goalNum}
				defaultValue={user.dailyWordsGoal}
			></input>
			<div className={`profile__goal-edit-buttons-container`}>
				<button onClick={saveGoal} className="profile__goal-editable-button">
					Save
				</button>
				<button onClick={cancelEditGoal} className="profile__goal-editable-button profile__goal-cancel-button">
					Cancel
				</button>
			</div>
		</h2>
	) : (
		<h2 className="profile__stats-text profile__daily-words-goal-container ">
			Daily Words Goal :<div className={`profile__day-number ${mode}`}> {user.dailyWordsGoal}</div>
			<button onClick={toggleEditGoal} className="profile__goal-edit-button">
				Edit
			</button>
		</h2>
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
