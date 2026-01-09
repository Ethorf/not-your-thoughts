import React from 'react'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'

// Components
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import TextButton from '@components/Shared/TextButton/TextButton'

// Utils
import { parseDate } from '@utils/parseDate'
import { getNodeStatus } from '@utils/nodeReadStatus'

// Hooks
import useIsMobile from '@hooks/useIsMobile'

// Styles
import styles from './PublicDashboardNodeEntry.module.scss'
import calculateWordCount from '@utils/calculateWordCount'

const getWordCount = (node) => {
  if (!node) {
    return 0
  }

  const {
    content,
    wdWordCount,
    num_of_words: numOfWords,
    wordCount: precomputedWordCount,
    calculatedWordCount: serverCalculatedWordCount,
  } = node

  const candidates = [
    precomputedWordCount,
    serverCalculatedWordCount,
    typeof wdWordCount === 'number' ? wdWordCount : null,
    typeof numOfWords === 'number' ? numOfWords : null,
  ]

  const firstValid = candidates.find((value) => typeof value === 'number' && value > 0)
  if (typeof firstValid === 'number') {
    return firstValid
  }

  const calculated = calculateWordCount(content)
  if (calculated > 0) {
    return calculated
  }

  return 0
}

export const PublicDashboardNodeEntry = ({ node = {}, userId }) => {
  const { id = null, title, pending, date_last_modified, connectionCount = 0 } = node
  const history = useHistory()
  const isMobile = useIsMobile()
  const status = getNodeStatus(id)

  const handleViewNode = () => {
    if (userId) {
      history.push(`/show-node-entry?userId=${userId}&entryId=${id}`)
    }
  }

  const handleExploreNode = () => {
    if (userId && id) {
      history.push(`/view-network?userId=${userId}&entryId=${id}`)
    } else {
      console.error('Cannot explore: missing userId or entry id', { userId, id })
    }
  }

  const wordCount = getWordCount(node)

  return (
    <li className={styles.wrapper} key={id}>
      {!pending ? (
        <div data-tooltip-id="main-tooltip" data-tooltip-content="date modified" className={styles.date}>
          {parseDate(date_last_modified)}
        </div>
      ) : (
        <div className={styles.date}>Not yet...</div>
      )}
      <div
        tooltip={`view: ${title}`}
        className={classNames(styles.titleButton, {
          [styles.read]: status === 'read',
          [styles.updated]: status === 'updated',
        })}
        onClick={handleViewNode}
      >
        {title}
      </div>
      {!isMobile && (
        <div className={styles.wordCount} data-tooltip-id="main-tooltip" data-tooltip-content="word count">
          {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
        </div>
      )}
      {!isMobile && <div className={styles.connectionCount}>{connectionCount} connections</div>}
      {!isMobile && (
        <span
          className={classNames(styles.readIndicator, {
            [styles.read]: status === 'read',
          })}
        >
          {status === 'updated' ? 'updated!' : status === 'read' ? 'read ✓' : 'unread'}
        </span>
      )}
      {!isMobile && (
        <DefaultButton
          className={styles.exploreButton}
          onClick={handleExploreNode}
          tooltip="Explore this node's connections"
        >
          Explore
        </DefaultButton>
      )}
    </li>
  )
}
