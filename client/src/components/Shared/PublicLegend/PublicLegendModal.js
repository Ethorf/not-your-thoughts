import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import 'react-responsive-modal/styles.css'

import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import { BaseModalWrapper } from '@components/Modals/BaseModalWrapper/BaseModalWrapper'
import { MODAL_NAMES } from '@constants/modalNames'
import { closeModal } from '@redux/reducers/modalsReducer'

import styles from './PublicLegendModal.module.scss'

/**
 * Public Legend Modal - shows help/info about the public interface
 * Uses Redux state management through BaseModalWrapper
 */
export const PublicLegendModal = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const handleClose = () => {
    dispatch(closeModal())
  }

  const handleLearnMore = () => {
    history.push('/show-node-entry?userId=ethorf&entryId=1435')
    handleClose()
  }

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.PUBLIC_LEGEND} className={styles.legendModal}>
      <div className={styles.content}>
        <h2 className={styles.title}>What's Going On Here?</h2>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Browse Networks</h3>
          <p className={styles.text}>
            Browse all available nodes and network starting point. Click on the centre node's title to view its content,
            or click on any of its connected nodes to center them and see their connections.
          </p>
          <div className={styles.highlight}>
            <strong>Dotted connection lines = external links</strong>
            <br />
            <strong>White spheres indicate unread nodes</strong>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Node Entry View</h3>
          <p className={styles.text}>
            Read the full content of a node. Click "Network" to explore its connections, or use "History" to see previous
            versions of the content.
          </p>
        </div>

        <h3 className={styles.subtitle}>Why are you doing this?</h3>

        <div className={styles.buttons}>
          <DefaultButton onClick={handleLearnMore} className={styles.actionButton}>
            Learn more in longform
          </DefaultButton>
          <DefaultButton onClick={handleClose} className={styles.actionButton}>
            Got it!
          </DefaultButton>
        </div>
      </div>
    </BaseModalWrapper>
  )
}

export default PublicLegendModal


