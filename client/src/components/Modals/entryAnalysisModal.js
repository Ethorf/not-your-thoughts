import React from 'react';
import './entryAnalysisModal.scss';
import { gradeLevel } from '../../misc/gradeLevel.js';

function EntryAnalysisModal(props) {
	const phraseRepetitionCount = (phrase, text) => {
		let re = new RegExp(phrase.toLowerCase(), 'g');
		if (text.toLowerCase().match(re)) {
			return text.toLowerCase().match(re).length;
		}
		return 0;
	};

	return (
		<div className={`entry-analysis-modal ${props.analysisModalOpen ? 'visible' : 'invisible'}`}>
			<h1 className="entry-analysis-modal__header">Entry Analysis</h1>
			<p> {props.content ? gradeLevel(props.content) : 'Loading Grade Level'}</p>
			<p>{`# of times you used the phrase: "I wonder" in this entry:${
				props.content ? phraseRepetitionCount('i wonder', props.content) : 'Loading phrase Count'
			}`}</p>
			<button onClick={props.toggleAnalysisModalOpen}>X</button>
		</div>
	);
}

export default EntryAnalysisModal;
