import React, { useEffect, useState } from 'react';
import './entryAnalysisModal.scss';
import { gradeLevel } from '../../misc/gradeLevel.js';
import { Button, Dialog, Container } from '@material-ui/core';
import { connect } from 'react-redux';
import axios from 'axios';

// import { addEntryAnalysis } from '../../redux/actions/entryActions.js';
import { loadUser } from '../../redux/actions/authActions.js';
import { getEntries } from '../../redux/actions/entryActions.js';

function EntryAnalysisModal(props) {
	const phraseRepetitionCount = (phrase, text) => {
		let re = new RegExp(phrase.toLowerCase(), 'g');
		if (text.toLowerCase().match(re)) {
			return text.toLowerCase().match(re).length;
		}
		return 0;
	};
	const addEntryAnalysis = async (id) => {
		const config = {
			headers: {
				'Content-Type': 'application/json',
				'x-auth-token': localStorage.getItem('token')
			}
		};
		try {
			console.log('entryAnalysis sent');
			await axios.post(`/api/updateUser/entryAnalysis/${id}`, config);
			await loadUser();
			await getEntries();
		} catch (err) {
			console.log('error with adding entry analysis');
		}
	};
	return (
		<Dialog open={props.analysisModalOpen}>
			<Container>
				<h1 className="entry-analysis-modal__header">Entry Analysis</h1>
				<h2>{props.date}</h2>
				<h3 className="entry__entry-date-wordcount entry__words">
					Time:{' '}
					{props.timeElapsed ? `${Math.trunc(props.timeElapsed / 60)}m:${props.timeElapsed % 60}s` : 'N/A'}
				</h3>
				<h3 className="entry__entry-date-wordcount entry__words">
					Wpm:
					{props.wpm ? props.wpm : 'N/A'}
				</h3>
				<h3 className="entry__entry-date-wordcount entry__words">
					Emotional Analysis:
					{props.pdEmotionAnalysis ? (
						`${props.pdEmotionAnalysis}`
					) : (
						<Button onClick={() => addEntryAnalysis(props.id)}>Analyze</Button>
					)}
				</h3>
				<p> {props.content ? gradeLevel(props.content) : 'Loading Grade Level'}</p>
				<h2 className="entry-analysis-modal__header">Tracked Phrases :</h2>
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

export default connect(mapStateToProps, { loadUser, getEntries })(EntryAnalysisModal);
