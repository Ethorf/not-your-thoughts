import React, { useEffect, useState } from 'react';
import './entryAnalysisModal.scss';
import { gradeLevel } from '../../misc/gradeLevel.js';
import { Button, Dialog, Container, CircularProgress } from '@material-ui/core';
import { connect } from 'react-redux';
import axios from 'axios';

import { loadUser } from '../../redux/actions/authActions.js';
import { getEntries } from '../../redux/actions/entryActions.js';
import DisplayEmotions from '../DisplayEmotions/DisplayEmotions.js';

function EntryAnalysisModal(props) {
	const [localEmotionData, setLocalEmotionData] = useState(null);
	const [loading, setLoading] = useState(false);

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
			await setLoading(true);
			console.log('entryAnalysis sent');
			let res = await axios.post(`/api/updateUser/entryAnalysis/${id}`, config);
			await setLocalEmotionData(res.data);
			await setLoading(false);
			await loadUser();
			await getEntries();
		} catch (err) {
			console.log('error with adding entry analysis');
		}
	};
	useEffect(() => {
		if (props.pdEmotionAnalysis) {
			setLocalEmotionData(props.pdEmotionAnalysis.emotion);
		}
	}, []);
	return (
		<Dialog open={props.analysisModalOpen}>
			<Container>
				<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
					<h1 className="entry-analysis-modal__header">Entry Analysis</h1>
					<button className="entry-analysis-modal__close-button" onClick={props.toggleAnalysisModalOpen}>
						X
					</button>
				</div>
				<h2>{props.date}</h2>
				<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', color: 'silver' }}>
					<h3 className="entry__entry-date-wordcount entry__words">
						Words:
						<span style={{ color: 'white' }}>{props.wordCount}</span>
					</h3>
					<h3 className="entry__entry-date-wordcount entry__words">
						Time:{' '}
						<span style={{ color: 'white' }}>
							{props.timeElapsed
								? `${Math.trunc(props.timeElapsed / 60)}m:${props.timeElapsed % 60}s`
								: 'N/A'}
						</span>
					</h3>
					<h3 className="entry__entry-date-wordcount entry__words">
						Wpm:
						<span style={{ color: 'white' }}>{props.wpm ? props.wpm : 'N/A'}</span>
					</h3>
				</div>
				<h3 className="entry-analysis-modal__sub-header">Emotional Analysis </h3>

				{localEmotionData ? (
					<DisplayEmotions data={localEmotionData} />
				) : loading ? (
					<CircularProgress color="secondary" />
				) : (
					<Button onClick={() => addEntryAnalysis(props.id)}>Analyze</Button>
				)}

				<p> {props.content ? gradeLevel(props.content) : 'Loading Grade Level'}</p>
				<h2 className="entry-analysis-modal__header">Tracked Phrases :</h2>
				{props.trackedPhrases.map((item) => (
					<p key={item.id}>{`Occurences of: "${item.phrase}":
				${props.content ? phraseRepetitionCount(item.phrase, props.content) : 'Loading phrase Count'}`}</p>
				))}
			</Container>
		</Dialog>
	);
}

const mapStateToProps = (state) => ({
	auth: state.auth
});

export default connect(mapStateToProps, { loadUser, getEntries })(EntryAnalysisModal);
