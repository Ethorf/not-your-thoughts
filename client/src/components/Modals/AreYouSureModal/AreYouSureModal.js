// Packages
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'react-responsive-modal/styles.css'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'

// Redux
import { closeModal } from '@redux/reducers/modalsReducer.js'
import { deleteEntry, fetchNodeEntriesInfo } from '@redux/reducers/currentEntryReducer'

import styles from './AreYouSureModal.module.scss'

export const AreYouSureModal = () => {
  const dispatch = useDispatch()
  const { entryId, title, entriesLoading } = useSelector((state) => state.currentEntry)

  const handleDeleteEntry = async () => {
    await dispatch(deleteEntry(entryId))
    await dispatch(fetchNodeEntriesInfo())
    await dispatch(closeModal())
  }

  //   TODO abstract this shit out into state so we can reuse this component for other are you sures
  return (
    <BaseModalWrapper modalName={MODAL_NAMES.ARE_YOU_SURE}>
      {entriesLoading ? (
        <SmallSpinner />
      ) : (
        <div className={styles.wrapper}>
          <h2>Are you sure you want to delete the node: {title}?!?!</h2>
          <div>
            <DefaultButton onClick={handleDeleteEntry}>Yes</DefaultButton>
            <DefaultButton onClick={() => dispatch(closeModal())}>Cancel</DefaultButton>
          </div>
        </div>
      )}
    </BaseModalWrapper>
  )
}
