import React from 'react';
import './entryAnalysisModal.scss';
import { gradeLevel } from '../../misc/gradeLevel.js';

function EntryAnalysisModal(props) {
	const phraseRepetitionCount = (phrase, text) => {
		let phraseCount = 0;
		let wordsArr = text.split(' ');
		wordsArr.map((item) => (item === phrase ? phraseCount++ : null));
		return phraseCount;
	};

	return (
		<div className={`entry-analysis-modal ${props.analysisModalOpen ? 'visible' : 'invisible'}`}>
			<h1 className="entry-analysis-modal__header">Entry Analysis</h1>
			<p>{props.content ? gradeLevel(props.content) : 'Loading Grade Level'}</p>
			<p>{props.content ? phraseRepetitionCount('wonder', props.content) : 'Loading phraseCount'}</p>

			<button onClick={props.toggleAnalysisModalOpen}>X</button>
		</div>
	);
}

export default EntryAnalysisModal;
