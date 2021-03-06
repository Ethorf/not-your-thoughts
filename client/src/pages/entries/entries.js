import React, { useEffect, useState } from 'react';
import '../profile/profile.scss';
import '../../styles/rubberDucky.scss';
import './entries.scss';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout, loadUser, toggleUserSetting } from '../../redux/actions/authActions';
import { deleteEntry, getEntries } from '../../redux/actions/entryActions.js';
import Entry from '../../components/entry/entry.js';
import Spinner from '../../components/spinner/spinner.js';

const Entries = ({ isAuthenticated, auth: { user }, deleteEntry, getEntries, entries, mode }) => {
	const [sort, setSort] = useState('Newest');
	useEffect(() => {
		loadUser();
		getEntries();
	}, [getEntries, sort]);

	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}

	const sortChange = (e) => {
		setSort(e.target.value);
	};

	const EntryComponent = () => {
		return entries
			.sort(sortSwitch(sort))
			.map((userData) => (
				<Entry
					key={userData.id}
					id={userData.id}
					className="profile profile__entry"
					wordCount={userData.numOfWords}
					date={userData.date}
					timeElapsed={userData.timeElapsed}
					wpm={userData.wpm}
					content={userData.content}
					deleteEntry={deleteEntry}
					getEntries={getEntries}
					trackedPhrases={user.trackedPhrases}
					pdEmotionAnalysis={userData.pdEmotionAnalysis}
				/>
			));
	};

	const ReverseEntryComponent = () => {
		return entries
			.map((userData) => (
				<Entry
					key={userData.id}
					id={userData.id}
					className="profile profile__entry"
					wordCount={userData.numOfWords}
					date={userData.date}
					timeElapsed={userData.timeElapsed}
					wpm={userData.wpm}
					content={userData.content}
					deleteEntry={deleteEntry}
					getEntries={getEntries}
					trackedPhrases={user.trackedPhrases}
					pdEmotionAnalysis={userData.pdEmotionAnalysis}
				/>
			))
			.reverse();
	};
	const sortSwitch = (sortFunc) => {
		switch (sortFunc) {
			case 'Most Words':
				return (a, b) => b.numOfWords - a.numOfWords;
			case 'Least Words':
				return (a, b) => a.numOfWords - b.numOfWords;
			case 'Longest Time':
				return (a, b) => b.timeElapsed - a.timeElapsed;
			case 'Shortest Time':
				return (a, b) => a.timeElapsed - b.timeElapsed;
			case 'Fastest WPM':
				return (a, b) => b.wpm - a.wpm;
			case 'Slowest WPM':
				return (a, b) => a.wpm - b.wpm;
			case 'Oldest':
				return (a, b) => a - b;
			case 'Newest':
				return (a, b) => b + a;
		}
		if (!sortFunc) return undefined;
	};
	const SavedEntries = () => {
		return (
			<>
				<form className={`entries__sort-container`}>
					<label for="sort">Sort By:</label>
					<select className={`entries__sort-select`} value={sort} name="sort" onChange={sortChange}>
						<option value={'Newest'}>Newest</option>
						<option value={'Oldest'}>Oldest</option>
						<option value={'Most Words'}>Most Words</option>
						<option value={'Least Words'}>Least Words</option>
						<option value={'Fastest WPM'}>Fastest WPM</option>
						<option value={'Slowest WPM'}>Slowest WPM</option>
						<option value={'Longest Time'}>Longest Time</option>
						<option value={'Shortest Time'}>Shortest Time</option>
					</select>
				</form>
				{entries.length === 0 ? (
					<h2>You have no saved journal entries</h2>
				) : sort === 'Newest' ? (
					<ReverseEntryComponent />
				) : (
					<EntryComponent />
				)}
			</>
		);
	};
	return user === null ? (
		<Spinner />
	) : (
		<>
			<div className={`profile ${mode}`}>
				<h2 className={`profile__header ${mode}`}>SAVED ENtRIES</h2>
				{user === null ? <Spinner /> : <SavedEntries />}
			</div>
		</>
	);
};

Entries.propTypes = {
	auth: PropTypes.object.isRequired,
	logout: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
	getEntries: PropTypes.func.isRequired,
	entries: PropTypes.array.isRequired
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	isAuthenticated: state.auth.isAuthenticated,
	goal: state.wordCount.goal,
	entries: state.entries.entries,
	loading: state.entries,
	mode: state.modes.mode
});

export default connect(mapStateToProps, { logout, deleteEntry, loadUser, getEntries, toggleUserSetting })(Entries);
