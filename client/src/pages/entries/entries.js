import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { logout, loadUser } from '../../redux/actions/authActions.js'
import { deleteJournalEntry, getJournalEntries } from '../../redux/actions/journalEntryActions.js'
import { toggleJournalConfigSetting } from '../../redux/actions/journalConfigActions.js'

import Entry from '../../components/Entry/Entry.js'
import NodeEntriesList from '../../components/NodeEntriesList/NodeEntriesList.js'

import '../Profile/Profile.scss'
import '../../styles/rubberDucky.scss'
import './Entries.scss'

import Spinner from '../../components/Shared/Spinner/Spinner.js'

const Entries = ({ auth: { user }, deleteJournalEntry, getJournalEntries, entries, mode }) => {
  const [sort, setSort] = useState('Newest')
  const [activeEntryType, setActiveEntryType] = useState('')

  useEffect(() => {
    getJournalEntries()
  }, [getJournalEntries, sort])

  const sortChange = (e) => {
    setSort(e.target.value)
  }

  // const EntryComponent = () => {
  //   return (
  //     entries
  //       // .sort(sortSwitch(sort))
  //       .map((entry) => (
  //         <Entry
  //           key={entry.id}
  //           id={entry.id}
  //           className="profile profile__entry"
  //           wordCount={entry.num_of_words}
  //           // date={entry.date}
  //           timeElapsed={entry.time_elapsed}
  //           wpm={entry.wpm}
  //           content={entry.content}
  //           // deleteJournalEntry={deleteJournalEntry}
  //           // getJournalEntries={getJournalEntries}
  //           // trackedPhrases={user.trackedPhrases}
  //           // pdEmotionAnalysis={entries.pdEmotionAnalysis}
  //         />
  //       ))
  //   )
  // }

  const EntryComponent = () => {
    return entries.map((entry) => <div>{entry.content}</div>)
  }

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
          deleteJournalEntry={deleteJournalEntry}
          getJournalEntries={getJournalEntries}
          trackedPhrases={user.trackedPhrases}
          pdEmotionAnalysis={userData.pdEmotionAnalysis}
        />
      ))
      .reverse()
  }
  const sortSwitch = (sortFunc) => {
    if (!sortFunc) return undefined

    switch (sortFunc) {
      case 'Most Words':
        return (a, b) => b.numOfWords - a.numOfWords
      case 'Least Words':
        return (a, b) => a.numOfWords - b.numOfWords
      case 'Longest Time':
        return (a, b) => b.timeElapsed - a.timeElapsed
      case 'Shortest Time':
        return (a, b) => a.timeElapsed - b.timeElapsed
      case 'Fastest WPM':
        return (a, b) => b.wpm - a.wpm
      case 'Slowest WPM':
        return (a, b) => a.wpm - b.wpm
      case 'Oldest':
        return (a, b) => a - b
      case 'Newest':
        return (a, b) => b + a
      default:
        return null
    }
  }
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
        {/* {entries.length === 0 ? (
          <h2>You have no saved journal entries</h2>
        ) : sort === 'Newest' ? (
          <ReverseEntryComponent />
        ) : (
          <EntryComponent />
        )} */}
        {entries.length === 0 ? <h2>You have no saved journal entries</h2> : <EntryComponent />}
      </>
    )
  }

  return (
    <div className={`profile ${mode}`}>
      <h2 className={`profile__header ${mode}`}>SAVED ENtRIES</h2>
      {/* <SavedEntries /> */}
      <NodeEntriesList />
    </div>
  )
}

Entries.propTypes = {
  auth: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  getJournalEntries: PropTypes.func.isRequired,
  entries: PropTypes.array.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated,
  goal: state.wordCount.goal,
  entries: state.entries.entries,
  loading: state.entries,
  mode: state.modes.mode,
})

export default connect(mapStateToProps, {
  logout,
  deleteJournalEntry,
  loadUser,
  getJournalEntries,
  toggleJournalConfigSetting,
})(Entries)
