import React, { useEffect, useState } from 'react';
import './entryAnalysisModal.scss';
import TrackedPhrasesModal from './trackedPhrasesModal.js';
import { gradeLevel } from '../../misc/gradeLevel.js';
import { Button, Dialog, Container } from '@material-ui/core';
import { connect } from 'react-redux';

function EntryAnalysisModal(props) {
	const phraseRepetitionCount = (phrase, text) => {
		let re = new RegExp(phrase.toLowerCase(), 'g');
		if (text.toLowerCase().match(re)) {
			return text.toLowerCase().match(re).length;
		}
		return 0;
	};
	return (
		<Dialog open={props.analysisModalOpen}>
			<Container>
				<h1 className="entry-analysis-modal__header">Entry Analysis</h1>
				<p> {props.content ? gradeLevel(props.content) : 'Loading Grade Level'}</p>
				<h2 className="entry-analysis-modal__header">
					Tracked Phrases :
					<TrackedPhrasesModal />
				</h2>
				{props.trackedPhrases.map((item) => (
					<p key={item.id}>{`Occurences of: "${item.phrase}":
				${props.content ? phraseRepetitionCount(item.phrase, props.content) : 'Loading phrase Count'}`}</p>
				))}
				<Button onClick={props.toggleAnalysisModalOpen}>Close</Button>
			</Container>
		</Dialog>
	);
}

const mapStateToProps = (state) => ({
	auth: state.auth
});

export default connect(mapStateToProps)(EntryAnalysisModal);
