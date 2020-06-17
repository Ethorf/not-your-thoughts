import React from 'react';
import './entryAnalysisModal.scss';
import { gradeLevel } from '../../misc/gradeLevel.js';

function EntryAnalysisModal(props) {
	return (
		<div className={`entry-analysis-modal ${props.analysisModalOpen ? 'visible' : 'invisible'}`}>
			<h1 className="entry-analysis-modal__header">Entry Analysis</h1>
			<p>{gradeLevel(props.content)}</p>
			<button onClick={props.toggleAnalysisModalOpen}>X</button>
		</div>
	);
}

export default EntryAnalysisModal;
