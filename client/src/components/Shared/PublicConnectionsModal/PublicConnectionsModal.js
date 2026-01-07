import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import 'react-responsive-modal/styles.css'

import { transformConnection } from '@utils/transformConnection'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { MODAL_NAMES } from '@constants/modalNames'
import { BaseModalWrapper } from '@components/Modals/BaseModalWrapper/BaseModalWrapper'
import { closeModal } from '@redux/reducers/modalsReducer'

import styles from './PublicConnectionsModal.module.scss'

const { PARENT, CHILD, SIBLING, EXTERNAL } = CONNECTION_TYPES.FRONTEND

/**
 * Public Connections Modal - shows all connections for a node entry
 * Uses Redux state management through BaseModalWrapper
 */
export const PublicConnectionsModal = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { modalData } = useSelector((state) => state.modals)

  // Get data from modalData (set when opening the modal)
  const connections = modalData?.connections || []
  const entryId = modalData?.entryId
  const userId = modalData?.userId

  const handleNodeClick = (connection) => {
    if (!connection || !userId) return

    if (connection.connection_type === EXTERNAL) {
      if (connection.foreign_source) {
        window.open(connection.foreign_source, '_blank', 'noopener,noreferrer')
      }
      return
    }

    const targetNode = transformConnection(entryId, connection)
    if (targetNode?.id) {
      history.push(`/show-node-entry?userId=${userId}&entryId=${targetNode.id}`)
      dispatch(closeModal())
    }
  }

  const getConnectionTypeLabel = (type) => {
    switch (type) {
      case PARENT:
        return 'Parent'
      case CHILD:
        return 'Child'
      case SIBLING:
        return 'Sibling'
      case EXTERNAL:
        return 'External Link'
      default:
        return type
    }
  }

  const handleClose = () => {
    dispatch(closeModal())
  }

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.PUBLIC_CONNECTIONS} className={styles.connectionsModal}>
      <h2 className={styles.title}>Connections</h2>
      <div className={styles.content}>
        {connections.length === 0 ? (
          <div className={styles.emptyMessage}>No connections found</div>
        ) : (
          <div className={styles.connectionsList}>
            {connections.map((connection) => {
              const targetNode = transformConnection(entryId, connection)
              const isExternal = connection.connection_type === EXTERNAL

              return (
                <div onClick={() => handleNodeClick(connection)} key={connection.id} className={styles.connectionItem}>
                  <div className={styles.connectionType}>{getConnectionTypeLabel(connection.connection_type)}</div>
                  <div className={styles.connectionContent}>
                    {isExternal ? (
                      <a
                        href={connection.foreign_source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.connectionLink}
                        onClick={handleClose}
                      >
                        {connection.primary_source || connection.foreign_source || 'External Link'}
                      </a>
                    ) : (
                      <button className={styles.connectionButton}>{targetNode?.title || 'Untitled'}</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </BaseModalWrapper>
  )
}

export default PublicConnectionsModal
