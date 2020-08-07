import React, { useEffect, useState } from 'react';
import './trackedPhrasesModal.scss';
import { Input, Button, Dialog, Container } from '@material-ui/core';
import { connect } from 'react-redux';
import { addTrackedPhrase, deleteTrackedPhrase } from '../../redux/actions/authActions';

function TrackedPhrasesModal({ addTrackedPhrase, deleteTrackedPhrase, auth: { user } }) {
	const [modalOpen, setModalOpen] = useState(false);
	const [phraseData, setPhraseData] = useState({
		phrase: ''
	});
	const phraseInput = (e) => {
		e.preventDefault();
		setPhraseData(e.target.value);
	};
	const onSubmit = async (e) => {
		e.preventDefault();
		await addTrackedPhrase({ phrase: phraseData });
		setPhraseData({ phrase: '' });
	};

	return (
		<>
			<Button onClick={() => setModalOpen(!modalOpen)}>Edit</Button>
			<Dialog open={modalOpen}>
				<Container>
					<h1 className="entry-analysis-modal__header">Tracked Phrases</h1>
					<ol>
						{user.trackedPhrases.map((item) => (
							<li className={`list-item`}>
								<h3 style={{ margin: '0' }}>{item.phrase}</h3>
								<Button onClick={() => deleteTrackedPhrase(item.id)}>Delete</Button>
							</li>
						))}
					</ol>
					<form className={`add-new-phrase-form`}>
						<h3 className={`add-new-phrase`}>Add New Phrase:</h3>
						<Input
							disableUnderline="true"
							onChange={phraseInput}
							placeholder="phrase"
							value={phraseData.phrase}
						></Input>{' '}
					</form>
					<Button onClick={onSubmit} type="submit">
						Add Phrase
					</Button>
					<Button onClick={() => setModalOpen(!modalOpen)}>Close</Button>
				</Container>
			</Dialog>
		</>
	);
}

const mapStateToProps = (state) => ({
	auth: state.auth
});

export default connect(mapStateToProps, { addTrackedPhrase, deleteTrackedPhrase })(TrackedPhrasesModal);
