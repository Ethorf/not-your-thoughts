import React, { useRef, useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { openSaveEntryModal, closeSaveEntryModal } from '../../redux/actions/modalActions.js';
import { TimelineMax } from 'gsap';
import '../../pages/main/main.scss';
import './saveEntryModal.scss';

const SaveEntryModal = ({ modals, openSaveEntryModal, closeSaveEntryModal }) => {
	const mode = useSelector((state) => state.modes.mode);

	// let modalOverlayContainer = useRef(null);
	let modalContentContainer = useRef(null);
	// const [overlayAnimation, setOverlayAnimation] = useState(null);
	const [contentAnimation, setContentAnimation] = useState(null);

	const overlayTl = new TimelineMax({ paused: true });
	const contentTl = new TimelineMax({ paused: true });

	// const openModalOverlayAnimation = () => {
	// 	setOverlayAnimation(overlayTl.to(modalOverlayContainer, { duration: 1, opacity: 1 }).play());
	// };

	const openModalContentAnimation = () => {
		setContentAnimation(
			contentTl
				.to(modalContentContainer, { duration: 0.2, y: 60, opacity: 1 })
				.to(modalContentContainer, { duration: 1.3, opacity: 1 })
				.to(modalContentContainer, { duration: 0.5, y: -200, opacity: 0 })
				.play()
		);
	};

	// const closeModalOverlayAnimation = () => {
	// 	setOverlayAnimation(overlayTl.to(modalOverlayContainer, { duration: 1, opacity: 1 }).reverse());
	// };

	const closeModalContentAnimation = () => {
		setContentAnimation(
			contentTl.to(modalContentContainer, { duration: 1, y: 100, opacity: 0, paused: true }).reverse()
		);
	};
	const closeModalAll = () => {
		closeModalContentAnimation();
		// closeModalOverlayAnimation();
		closeSaveEntryModal();
	};
	const openModalAll = () => {
		openModalContentAnimation();
		// openModalOverlayAnimation();
		// openSaveEntryModal();
		setTimeout(() => {
			closeSaveEntryModal();
		}, 3000);
	};

	useEffect(() => {
		if (modals.saveEntryModalOpen) {
			openModalAll();
		}
	}, [modals]);

	return (
		<div className={`save-entry-modal${mode}`}>
			{/* <button onClick={openModalAll}>SaveEntry Modal Open Test</button> */}
			{/* <div
				className={`${
					modals.saveEntryModalOpen ? 'save-entry-modal__overlay-open' : 'save-entry-modal__overlay-closed'
				} ${mode}`}
				ref={(div) => (modalOverlayContainer = div)}
			></div> */}
			<div
				className={`${modals.saveEntryModalOpen ? 'save-entry-modal__open' : 'save-entry-modal__closed'}`}
				ref={(div) => (modalContentContainer = div)}
			>
				<h1 className="save-entry-modal__text">Entry Saved!</h1>
				{/* <button onClick={closeModalAll}>SaveEntry Modal CloseTest</button> */}
			</div>
		</div>
	);
};

const mapStateToProps = (state) => ({
	modals: state.modals
});
export default connect(mapStateToProps, {
	openSaveEntryModal,
	closeSaveEntryModal
})(SaveEntryModal);
