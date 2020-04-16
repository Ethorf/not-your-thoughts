import React, { Component, Fragment, useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { TimelineMax } from 'gsap';
import '../../pages/main/main.scss';
import './successModal.scss';
//Redux Actions
import { openSuccessModal, closeSuccessModal } from '../../redux/actions/modalActions.js';
import { saveEntry } from '../../redux/actions/entryActions';
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
	goalReachedStatus,
	increaseDays
}) => {
	let modalOverlayContainer = useRef(null);
	let modalContentContainer = useRef(null);
	const [overlayAnimation, setOverlayAnimation] = useState(null);
	const [contentAnimation, setContentAnimation] = useState(null);
	const [gratitudeOpen, setGratitudeOpen] = useState(false);
	const overlayTl = new TimelineMax({ paused: true });
	const contentTl = new TimelineMax({ paused: true });
	const openGratitude = () => {
		setGratitudeOpen(true);
	};
	const openModalOverlayAnimation = () => {
		setOverlayAnimation(overlayTl.to(modalOverlayContainer, { duration: 1, delay: 2.5, opacity: 1 }).play());
	};
	const closeModalOverlayAnimation = () => {
		setOverlayAnimation(overlayTl.to(modalOverlayContainer, { duration: 1, opacity: 1 }).reverse());
	};
	const openModalContentAnimation = () => {
		setContentAnimation(
			contentTl.to(modalContentContainer, { duration: 1, delay: 2.5, y: 100, opacity: 1 }).play()
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
		}, 300);
		setTimeout(() => {
			openSuccessModal();
		}, 1600);
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
		saveEntry({ entry: entry });
	};
	useEffect(() => {
		if (wordCount >= goal && goalReachedStatus === false) {
			openModalAll();
		}
	}, [wordCount, goalReachedStatus, goal, user]);
	return (
		<Fragment>
			{/*	<button onClick={openModalAll}>Modal Open Test</button> */}
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
						<h4 className="modal__goal">Would you like to do a gratitude practice for 3 more XP?</h4>
						<div className="modal__gratitude-buttons">
							<button onClick={openGratitude}>Yes</button>
							<button>No</button>
						</div>
					</div>
				</div>

				{gratitudeOpen ? <Gratitude /> : null}
				<button onClick={closeSaveModalAll} className="modal__close-button">
					Save and Close
				</button>
				<button onClick={closeModalAll} className="modal__close-button">
					Just Close
				</button>
			</div>
		</Fragment>
	);
};

SuccessModal.propTypes = {
	auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	modals: state.modals,
	wordCount: state.wordCount.wordCount,
	entry: state.entries.entry,
	goalReachedStatus: state.wordCount.goalReachedStatus,
	goal: state.wordCount.goal,
	mode: state.modes.mode
});

export default connect(mapStateToProps, {
	loadUser,
	openSuccessModal,
	closeSuccessModal,
	saveEntry,
	goalReached,
	increaseDays
})(SuccessModal);
