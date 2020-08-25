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
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

const Entries = ({ isAuthenticated, auth: { user }, deleteEntry, getEntries, entries, mode }) => {
	const [sort, setSort] = useState('newest');
	const [sortFunc, setSortFunc] = useState((a, b) => a - b);
	const [sortedEntries, setSortedEntries] = useState(null);
	// let defaultSort = entries.sort();
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

	const sortFuncTest = (a, b) => {
		return a - b;
	};
	const sortSwitch = (sortFunc) => {
		switch (sortFunc) {
			case 'mostWords':
				return (a, b) => b.numOfWords - a.numOfWords;
			case 'leastWords':
				return (a, b) => a.numOfWords - b.numOfWords;
			case 'oldest':
				return undefined;
		}
		if (!sortFunc) return undefined;
	};

	//Okay so first the MenuItem selects a value which triggers the sortChange for the value
	//then the sortSwitch, which returns a function changes itself based on the sort, and the sorted entries
	//
	const SavedEntries = () => {
		return (
			<>
				<div className={`entries__sort-container`}>
					<h2>Sorting By:{sort}</h2>
					<FormControl>
						<InputLabel style={{ color: 'white' }} id="demo-simple-select-label">
							Sort By
						</InputLabel>
						<Select
							// labelId="demo-simple-select-label"
							// id="demo-simple-select"
							// value={age}
							onChange={sortChange}
						>
							<MenuItem value={'newest'}>Newest</MenuItem>
							<MenuItem value={'oldest'}>Oldest</MenuItem>
							<MenuItem value={'mostWords'}>Most Words</MenuItem>
							<MenuItem value={'leastWords'}>Least Words</MenuItem>
							<MenuItem value={'fastestWPM'}>Fastest WPM</MenuItem>
							<MenuItem value={'slowestWPM'}>Slowest WPM</MenuItem>
							<MenuItem value={'longestTime'}>Longest Time</MenuItem>
							<MenuItem value={'shortestTime'}>Shortest Time</MenuItem>
						</Select>
					</FormControl>
				</div>
				{entries.length === 0 ? (
					<h2>You have no saved journal entries</h2>
				) : (
					entries
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
						))

					// .reverse()
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
