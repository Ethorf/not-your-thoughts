import React, { useState } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'

// Utils
import { parseDate } from '@utils/parseDate'
import { formatTime } from '@utils/formatTime.js'

import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

// Components
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner.js'

// Constants
import { MODAL_NAMES } from '@constants/modalNames.js'

import styles from './JournalEntry.module.scss'

const getLatestContentHtml = (content) => {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content) && content.length > 0 && content[0] != null) {
    return typeof content[0] === 'string' ? content[0] : ''
  }
  return ''
}

export const JournalEntry = ({ journal: { id, date_created, num_of_words, content, total_time_taken, wpm } }) => {
  const [localLoading, setLocalLoading] = useState(false)

  const dispatch = useDispatch()
  const latestContent = getLatestContentHtml(content)

  const handleOpenContentModal = async () => {
    setLocalLoading(true)
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.JOURNAL_CONTENT))
    setLocalLoading(false)
  }

  return (
    <li className={styles.wrapper} key={id}>
      <div className={styles.nodeValue}>Date: {parseDate(date_created)}</div>
      <div
        data-tooltip-id="main-tooltip"
        data-tooltip-content="expand"
        onClick={handleOpenContentModal}
        className={classNames(styles.nodeValue, styles.contentButton)}
      >
        {localLoading ? (
          <>
            <SmallSpinner />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>
              Content:
              <span />
            </span>
            {latestContent ? (
              <div dangerouslySetInnerHTML={{ __html: latestContent.slice(0, 5) }} />
            ) : (
              <span>No content yet...</span>
            )}
            <span>...</span>
          </>
        )}
      </div>
      <div className={styles.nodeValue}># of Words: {num_of_words}</div>
      <div className={styles.nodeValue}>Time taken: {formatTime(total_time_taken)}</div>
      <div className={styles.nodeValue}>WPM: {wpm}</div>
    </li>
  )
}
