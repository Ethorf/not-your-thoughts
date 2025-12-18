import React from 'react'
import { Modal } from 'react-responsive-modal'
import { useHistory } from 'react-router-dom'
import 'react-responsive-modal/styles.css'
import { transformConnection } from '@utils/transformConnection'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import styles from './PublicConnectionsModal.module.scss'

const { PARENT, CHILD, SIBLING, EXTERNAL } = CONNECTION_TYPES.FRONTEND

const PublicConnectionsModal = ({ isOpen, onClose, connections = [], entryId, userId }) => {
  const history = useHistory()

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
      onClose() // Close modal after navigation
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

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center={false} // Disable centering for full-screen mobile
      classNames={{
        modal: styles.modal,
        overlay: styles.overlay,
        closeButton: styles.closeButton,
      }}
    >
      <div className={styles.content}>
        <h2 className={styles.title}>Connections</h2>
        {connections.length === 0 ? (
          <div className={styles.emptyMessage}>No connections found</div>
        ) : (
          <div className={styles.connectionsList}>
            {connections.map((connection) => {
              const targetNode = transformConnection(entryId, connection)
              const isExternal = connection.connection_type === EXTERNAL

              return (
                <div key={connection.id} className={styles.connectionItem}>
                  <div className={styles.connectionType}>{getConnectionTypeLabel(connection.connection_type)}</div>
                  <div className={styles.connectionContent}>
                    {isExternal ? (
                      <a
                        href={connection.foreign_source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.connectionLink}
                        onClick={() => onClose()}
                      >
                        {connection.primary_source || connection.foreign_source || 'External Link'}
                      </a>
                    ) : (
                      <button
                        className={styles.connectionButton}
                        onClick={() => handleNodeClick(connection)}
                      >
                        {targetNode?.title || 'Untitled'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PublicConnectionsModal

