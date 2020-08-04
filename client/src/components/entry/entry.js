import React, { useState } from 'react';
import { connect } from 'react-redux';
import './entry.scss';
import Arrow from '../../assets/Icons/single-arrow-3.png';
import EntryAnalysisModal from '../Modals/entryAnalysisModal.js';
import { Dialog, Button, Container } from '@material-ui/core';

function Entry(props) {
	const [open, setOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [analysisModalOpen, setAnalysisModalOpen] = useState(false);

	const toggleDeleteModal = () => {
		setDeleteModalOpen(!deleteModalOpen);
	};

	return (
		<>
			<div className="entry__entry-date-wordcount-container">
				<EntryAnalysisModal
					content={props.content}
					toggleAnalysisModalOpen={() => setAnalysisModalOpen(!analysisModalOpen)}
					analysisModalOpen={analysisModalOpen}
					trackedPhrases={props.trackedPhrases}
				/>
				<h3 className="entry__entry-date-wordcount entry__date">{props.date}</h3>
				<div className="entry__wordcount-container">
					<h3 className="entry__entry-date-wordcount entry__words">Words: {props.wordCount}</h3>
				</div>
				<button
					className={`entry__button ${open ? 'entry__button-open' : 'entry__button-closed'}`}
					onClick={() => setOpen(!open)}
				>
					<img className="entry__entry-arrow" src={Arrow} alt="expand entry arrow" />
				</button>
				<Button onClick={() => setAnalysisModalOpen(!analysisModalOpen)}>Analysis</Button>
				<button onClick={toggleDeleteModal} className="entry__delete-button">
					X
				</button>
			</div>

			<Dialog color="secondary" open={deleteModalOpen} className={`entry__delete-modal`}>
				<Container className={`entry__delete-modal-container`}>
					<h3 className="entry__delete-modal-text">Are you sure you want to delete this entry?</h3>
					<div className="entry__delete-modal-buttons-container">
						<Button
							onClick={() => {
								props.deleteEntry(props.id);
								toggleDeleteModal();
							}}
							className="entry__delete-modal-button"
						>
							Yes
						</Button>
						<Button onClick={toggleDeleteModal} className="entry__delete-modal-button">
							No
						</Button>
					</div>
				</Container>
			</Dialog>
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
