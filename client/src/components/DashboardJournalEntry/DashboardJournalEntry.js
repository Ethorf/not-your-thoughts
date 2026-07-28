import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import classNames from 'classnames'

import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import TextButton from '@components/Shared/TextButton/TextButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import { parseDate } from '@utils/parseDate'
import { formatTime } from '@utils/formatTime'
import { getJournalTextPreview, getLatestContentHtml } from '@utils/journalEntryContent'
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer'
import { MODAL_NAMES } from '@constants/modalNames'

import styles from './DashboardJournalEntry.module.scss'

export const DashboardJournalEntry = ({ journal = {}, variant = 'list' }) => {
  const {
    id = null,
    date_created: dateCreated,
    date_last_modified: dateLastModified,
    num_of_words: numOfWords,
    content,
    total_time_taken: totalTimeTaken,
    wpm,
  } = journal

  const dispatch = useDispatch()
  const [localLoading, setLocalLoading] = useState(false)
  const entryDate = parseDate(dateLastModified || dateCreated)
  const titlePreview = getJournalTextPreview(content) || entryDate || 'Journal entry'
  const contentHtml = getLatestContentHtml(content)
  const isStream = variant === 'stream'

  const handleOpenContentModal = async () => {
    setLocalLoading(true)
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.JOURNAL_CONTENT))
    setLocalLoading(false)
  }

  const handleOpenAreYouSureModal = async () => {
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
  }

  if (isStream) {
    return (
      <li className={styles.streamWrapper} key={id}>
        <div className={styles.streamMeta}>
          <span className={styles.streamDate}>{entryDate}</span>
          <span className={styles.streamWords}>
            {Number(numOfWords || 0).toLocaleString()} {Number(numOfWords) === 1 ? 'word' : 'words'}
          </span>
        </div>
        <div className={styles.streamContent} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </li>
    )
  }

  return (
    <li className={styles.wrapper} key={id}>
      <div data-tooltip-id="main-tooltip" data-tooltip-content="date modified" className={styles.dateColumn}>
        {entryDate}
      </div>
      <div className={styles.titleCell}>
        {localLoading ? (
          <span className={styles.loadingTitle}>
            <SmallSpinner />
            <span>Loading...</span>
          </span>
        ) : (
          <TextButton
            tooltip="view journal"
            className={classNames(styles.titleButton, styles.ellipsisify)}
            onClick={handleOpenContentModal}
          >
            {titlePreview}
          </TextButton>
        )}
      </div>
      <div className={styles.statColumn}>
        <span>Words: </span>
        <span className={styles.statValue}>{numOfWords}</span>
      </div>
      <div className={styles.statColumn}>
        <span>Time: </span>
        <span className={styles.statValue}>{formatTime(totalTimeTaken)}</span>
      </div>
      <div className={styles.statColumn}>
        <span>WPM: </span>
        <span className={styles.statValue}>{wpm}</span>
      </div>
      <DefaultButton
        data-tooltip-id="main-tooltip"
        data-tooltip-content="delete journal"
        className={styles.deleteButton}
        onClick={handleOpenAreYouSureModal}
      >
        X
      </DefaultButton>
    </li>
  )
}
