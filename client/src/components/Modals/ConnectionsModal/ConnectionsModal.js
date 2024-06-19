// Packages
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import NodeSelectDropdown from '@components/Shared/NodeSelectDropdown/NodeSelectDropdown'

// Redux
import { createHorizontalConnection, fetchConnections } from '@redux/reducers/connectionsReducer'
import { createNodeEntry } from '@redux/reducers/currentEntryReducer'

import { showToast } from '@utils/toast.js'

import styles from './ConnectionsModal.module.scss'

export const ConnectionsModal = () => {
  const dispatch = useDispatch()
  const [localForeignEntryId, setLocalForeignEntryId] = useState(null)
  const [newNodeTitle, setNewNodeTitle] = useState('')

  const { entryId, title, nodeEntriesInfo } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  useEffect(() => {
    dispatch(fetchConnections(entryId))
  }, [dispatch, entryId])

  const handleCreateConnection = async () => {
    if (localForeignEntryId) {
      dispatch(createHorizontalConnection({ primary_entry_id: entryId, foreign_entry_id: localForeignEntryId }))
    } else {
      console.log('no jeff title here')
      // TODO
      // await this so we can get a node id then create a connection for grock
      // add toast -> may need to work on z-index stuff
      // Add close modal button
      const newNode = await dispatch(createNodeEntry({ title: newNodeTitle }))
      const newForeignEntryId = newNode?.payload?.id ?? null
      await dispatch(createHorizontalConnection({ primary_entry_id: entryId, foreign_entry_id: newForeignEntryId }))
    }
  }
  console.log('<<<<<< localForeignEntryId >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(localForeignEntryId)
  console.log('newNodeTitle is:')
  console.log(newNodeTitle)

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.CONNECTIONS} className={styles.overflowVisible}>
      <div className={styles.wrapper}>
        <h2>{title}</h2>
        <NodeSelectDropdown
          onChange={(value) => setNewNodeTitle(value)}
          onSelect={(value) => setLocalForeignEntryId(value)}
        />
        <DefaultButton onClick={handleCreateConnection}>Create horizontal connection</DefaultButton>
        <div>
          {connections.length ? (
            <div>
              <h3>Connections:</h3>
              {connections.map((c) => (
                <p>{c.foreign_entry_title}</p>
              ))}
            </div>
          ) : (
            'No connections yet...'
          )}
        </div>
      </div>
    </BaseModalWrapper>
  )
}
