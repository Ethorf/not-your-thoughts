import React, { useState } from 'react';
import { connect } from 'react-redux';
import './entry.scss';
import Arrow from '../../assets/Icons/single-arrow-3.png';
import EntryAnalysisModal from '../Modals/entryAnalysisModal.js';

function Entry(props) {
	const [open, setOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [analysisModalOpen, setAnalysisModalOpen] = useState(false);

	const toggleEntry = () => {
		setOpen(!open);
	};

	const toggleDeleteModal = () => {
		setDeleteModalOpen(!deleteModalOpen);
	};
	const toggleAnalysisModalOpen = () => {
		setAnalysisModalOpen(!analysisModalOpen);
	};

	return (
		<>
			<div className="entry__entry-date-wordcount-container">
				<EntryAnalysisModal
					content={props.content}
					toggleAnalysisModalOpen={toggleAnalysisModalOpen}
					analysisModalOpen={analysisModalOpen}
				/>
				<h3 className="entry__entry-date-wordcount entry__date">{props.date}</h3>
				<div className="entry__wordcount-container">
					<h3 className="entry__entry-date-wordcount entry__words">Words: {props.wordCount}</h3>
				</div>
				<button
					className={`entry__button ${open ? 'entry__button-open' : 'entry__button-closed'}`}
					onClick={toggleEntry}
				>
					<img className="entry__entry-arrow" src={Arrow} alt="expand entry arrow" />
				</button>
				<button onClick={toggleDeleteModal} className="entry__delete-button">
					X
				</button>
				<button onClick={toggleAnalysisModalOpen} className="entry__open-analysis-modal">
					Analysis
				</button>
			</div>
			<div className={deleteModalOpen ? 'entry__delete-modal-open' : 'entry__delete-modal-closed'}>
				<h3 className="entry__delete-modal-text">Are you sure you want to delete this entry?</h3>
				<div className="entry__delete-modal-buttons-container">
					<button
						onClick={() => {
							props.deleteEntry(props.id);
							toggleDeleteModal();
						}}
						className="entry__delete-modal-button"
					>
						Yes
					</button>
					<button onClick={toggleDeleteModal} className="entry__delete-modal-button">
						No
					</button>
				</div>
			</div>
			<h4 className={`entry__entry-content ${props.mode} ${open ? 'entry__entry-open' : 'entry__entry-closed'}`}>
				{props.content}
			</h4>
		</>
	);
}

const mapStateToProps = (state) => ({
	mode: state.modes.mode
});

export default connect(mapStateToProps)(Entry);
