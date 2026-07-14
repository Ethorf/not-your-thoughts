import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

// Components
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import EditNodeLink from '@components/Shared/EditNodeLink/EditNodeLink'
import StarButton from '@components/Shared/StarButton/StarButton'

// Utils
import { parseDate } from '@utils/parseDate'
import calculateWordCount from '@utils/calculateWordCount'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { openModal } from '@redux/reducers/modalsReducer.js'

// Constants
import { MODAL_NAMES } from '@constants/modalNames.js'

// Styles
import styles from './DashboardNodeEntry.module.scss'

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

export const DashboardNodeEntry = ({ node = {} }) => {
  const { id = null, starred, title, pending, date_last_modified } = node
  const dispatch = useDispatch()
  const history = useHistory()
  const wordCount = getWordCount(node)

  const handleOpenAreYouSureModal = async () => {
    await dispatch(setEntryById(id))
    await dispatch(openModal(MODAL_NAMES.ARE_YOU_SURE))
  }

  const handleExploreNode = async () => {
    await dispatch(setEntryById(id))
    history.push('/explore')
  }

  return (
    <li className={styles.wrapper} key={id}>
      <StarButton id={id} initialStarred={starred} />
      {!pending ? (
        <div data-tooltip-id="main-tooltip" data-tooltip-content="date modified" className={styles.dateColumn}>
          {parseDate(date_last_modified)}
        </div>
      ) : (
        <div className={styles.dateColumn}>Not yet...</div>
      )}
      <div className={styles.titleCell}>
        <EditNodeLink node={{ id, title }} />
      </div>
      <div className={styles.wordCount} data-tooltip-id="main-tooltip" data-tooltip-content="word count">
        {pending ? '—' : `${wordCount.toLocaleString()} ${wordCount === 1 ? 'word' : 'words'}`}
      </div>
      <DefaultButton
        className={styles.exploreButton}
        onClick={handleExploreNode}
        tooltip="Explore this node's connections"
      >
        Explore
      </DefaultButton>
      <DefaultButton className={styles.deleteButton} onClick={handleOpenAreYouSureModal}>
        X
      </DefaultButton>
    </li>
  )
}
