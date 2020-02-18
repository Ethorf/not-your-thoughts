import React from 'react';
import { connect } from 'react-redux';
import { toggleEditGoal, changeGoal } from '../../redux/actions/index';
import '../../pages/profile/profile.scss';

function ProfileGoalEdit({ goal, toggleEditGoal, goalIsEditable, changeGoal }) {
	const goalNum = (e) => {
		e.preventDefault();
		changeGoal(e.target.value);
	};

	const saveGoal = () => {
		console.error('flenty');
		toggleEditGoal();
	};

	const cancelEditGoal = () => {
		changeGoal(goal);
		toggleEditGoal();
	};
	return goalIsEditable ? (
		<div>
			<h2 className="profile__last-day">
				Daily Words Goal:<input onChange={goalNum} defaultValue={goal}></input>
				<button onClick={saveGoal} className="profile__goal-edit-button">
					Save
				</button>
				<button onClick={cancelEditGoal} className="profile__goal-edit-button">
					Cancel
				</button>
			</h2>
		</div>
	) : (
		<div>
			<h2 className="profile__last-day">
				Daily Words Goal:<div className="profile__day-number"> {goal}</div>
				<button onClick={toggleEditGoal} className="profile__goal-edit-button">
					Edit
				</button>
			</h2>
		</div>
	);
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	isAuthenticated: state.auth.isAuthenticated,
	goal: state.wordCount.goal,
	goalIsEditable: state.wordCount.goalIsEditable
});
export default connect(mapStateToProps, { toggleEditGoal, changeGoal })(ProfileGoalEdit);
