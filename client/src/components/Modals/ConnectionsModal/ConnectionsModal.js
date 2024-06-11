// Packages
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import NodeSelectDropdown from '@components/Shared/NodeSelectDropdown/NodeSelectDropdown'

// Redux
import { createHorizontalConnection, fetchConnections } from '@redux/reducers/connectionsReducer'

import styles from './ConnectionsModal.module.scss'

export const ConnectionsModal = () => {
  const dispatch = useDispatch()

  const { wordCount, content, entryId, wpm, timeElapsed, nodeEntriesInfo } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  console.log('nodeEntriesInfo is:')
  console.log(nodeEntriesInfo)

  useEffect(() => {
    dispatch(fetchConnections(entryId))
  }, [dispatch])

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.CONNECTIONS}>
      <div className={styles.wrapper}>
        <h2>Connections</h2>
        <NodeSelectDropdown />
        <DefaultButton>Create horizontal connection</DefaultButton>
        {/* TODO make list of target connections here */}
      </div>
    </BaseModalWrapper>
  )
}
