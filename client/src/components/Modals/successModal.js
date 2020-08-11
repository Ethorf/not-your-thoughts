import React, { Fragment, useRef, useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { TimelineMax } from 'gsap';
import '../../pages/main/main.scss';
import './successModal.scss';
//Redux Actions
import { openSuccessModal, closeSuccessModal } from '../../redux/actions/modalActions.js';
import { saveEntry, toggleTimerActive } from '../../redux/actions/entryActions';
import { goalReached } from '../../redux/actions/index';
import { increaseDays, loadUser } from '../../redux/actions/authActions';
import { Gratitude } from '../gratitude/gratitude';

const SuccessModal = ({
	auth: { user },
	entry,
	modals,
	openSuccessModal,
	closeSuccessModal,
	saveEntry,
	wordCount,
	goalReached,
	goal,
	loadUser,
	toggleTimerActive,
	goalReachedStatus,
	increaseDays,
	timeElapsed
}) => {
	let modalOverlayContainer = useRef(null);
	let modalContentContainer = useRef(null);
	const [overlayAnimation, setOverlayAnimation] = useState(null);
	const [contentAnimation, setContentAnimation] = useState(null);
	const [gratitudeOpen, setGratitudeOpen] = useState(false);
	const [gratitudeCompleted, setGratitudeCompleted] = useState(false);
	const overlayTl = new TimelineMax({ paused: true });
	const contentTl = new TimelineMax({ paused: true });

	const openGratitude = () => {
		setGratitudeOpen(true);
	};
	const closeGratitude = () => {
		setGratitudeOpen(false);
		setGratitudeCompleted(true);
	};
	const openModalOverlayAnimation = () => {
		setOverlayAnimation(overlayTl.to(modalOverlayContainer, { duration: 1, delay: 1.2, opacity: 0.7 }).play());
	};
	const closeModalOverlayAnimation = () => {
		setOverlayAnimation(overlayTl.to(modalOverlayContainer, { duration: 1, opacity: 0.7 }).reverse());
	};
	const openModalContentAnimation = () => {
		setContentAnimation(
			contentTl.to(modalContentContainer, { duration: 1, delay: 1.2, y: 100, opacity: 1 }).play()
		);
	};
	const closeModalContentAnimation = () => {
		setContentAnimation(contentTl.to(modalContentContainer, { duration: 1, y: 100, opacity: 0 }).reverse());
	};
	const openModalAll = () => {
		goalReached();
		openModalOverlayAnimation();
		openModalContentAnimation();
		increaseDays();
		setTimeout(() => {
			loadUser();
		}, 100);
		setTimeout(() => {
			openSuccessModal();
		}, 1000);
	};

	const closeModalAll = () => {
		closeModalContentAnimation();
		closeModalOverlayAnimation();
		closeSuccessModal();
	};

	const closeSaveModalAll = () => {
		closeModalContentAnimation();
		closeModalOverlayAnimation();
		closeSuccessModal();
		goalReached();
		saveEntry({ entry: entry, timeElapsed: timeElapsed });
	};
	useEffect(() => {
		if (wordCount > 0 && wordCount <= user.dailyWordsGoal) {
			toggleTimerActive(true);
		} else if (wordCount >= user.dailyWordsGoal && goalReachedStatus === false) {
			openModalAll();
			toggleTimerActive(false);
		}
	}, [wordCount, goalReachedStatus, goal, user]);
	return (
		<Fragment>
			{/*<button onClick={openModalAll}>Modal Open Test</button> */}
			<div
				className={`${modals.successModalOpen ? 'main__modal2OverlayOpen' : 'main__modal2OverlayClosed'}`}
				ref={(div) => (modalOverlayContainer = div)}
			></div>
			<div
				className={`${modals.successModalOpen ? 'main__modal2' : 'main__modal2Closed'}`}
				ref={(div) => (modalContentContainer = div)}
			>
				<div className={gratitudeOpen ? 'invisible' : 'visible'}>
					<h2 className="modal__congratulations">
						CONGRATULATIONS {user && user.name.toUpperCase().split(' ')[0]}!
					</h2>
					<div className="modal__mainText">
						<h2 className="modal__goal">You've reached your goal for today</h2>
						<h3 className="modal__goal">
							You have completed {user && user.consecutiveDays} days in a row, and{' '}
							{user && user.totalDays} days total
						</h3>
						{gratitudeCompleted ? null : (
							<>
								<h4 className="modal__gratitude-prompt">
									Would you like to do a bonus gratitude practice?
								</h4>
								<div className="modal__gratitude-buttons-container">
									<Button className="modal__gratitude-button" onClick={openGratitude}>
										Yes
									</Button>
									<Button onClick={closeGratitude} className="modal__gratitude-button">
										No
									</Button>
								</div>
							</>
						)}
					</div>
				</div>

				{gratitudeOpen ? <Gratitude closeGratitude={closeGratitude} /> : null}
				{gratitudeOpen || gratitudeCompleted === false ? null : (
					<>
						<button onClick={closeSaveModalAll} className="modal__close-button">
							Save and Close
						</button>
						<button onClick={closeModalAll} className="modal__close-button">
							Just Close
						</button>
					</>
				)}
			</div>
		</Fragment>
	);
};

SuccessModal.propTypes = {
	auth: PropTypes.object.isRequired
};

const mapStateToProps = (state, props) => ({
	auth: state.auth,
	modals: state.modals,
	wordCount: state.wordCount.wordCount,
	entry: state.entries.entry,
	goalReachedStatus: state.wordCount.goalReachedStatus,
	goal: state.wordCount.goal,
	mode: state.modes.mode,
	setTimerActive: props.setTimerActive,
	timeElapsed: state.entries.timeElapsed
});

export default connect(mapStateToProps, {
	loadUser,
	openSuccessModal,
	closeSuccessModal,
	saveEntry,
	goalReached,
	increaseDays,
	toggleTimerActive
})(SuccessModal);
