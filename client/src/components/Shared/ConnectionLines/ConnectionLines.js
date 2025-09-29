import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { transformConnection } from '@utils/transformConnection'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import styles from './ConnectionLines.module.scss'

import { setEntryById } from '@redux/reducers/currentEntryReducer'

const { PARENT, CHILD, SIBLING, EXTERNAL } = CONNECTION_TYPES.FRONTEND

const ConnectionLines = ({ entryId }) => {
  const { connections } = useSelector((state) => state.connections)
  const dispatch = useDispatch()

  const handleConnectionLineClick = async (id) => {
    await dispatch(setEntryById(id))
  }
  // Group connections by type for rendering lines
  const connectionLines = useMemo(() => {
    if (!connections || !entryId) return { parents: [], children: [], siblings: [], externals: [] }

    const grouped = connections.reduce((acc, conn) => {
      const transformed = transformConnection(entryId, conn)
      const type = transformed.connection_type || conn.connection_type

      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(transformed)
      return acc
    }, {})

    return {
      parents: grouped[PARENT] || [],
      children: grouped[CHILD] || [],
      siblings: grouped[SIBLING] || [],
      externals: grouped[EXTERNAL] || [],
    }
  }, [connections, entryId])

  const isEven = (num) => num % 2 === 0

  if (!connections || connections.length === 0) {
    return null
  }
  console.log(connectionLines)
  return (
    <div className={styles.connectionLinesWrapper}>
      {/* Parent connections - top */}
      {connectionLines.parents.map((parent, index) => (
        <div
          key={`parent-${parent.id}`}
          onClick={() => handleConnectionLineClick(parent.id)}
          className={styles.connectionLine}
          style={{
            '--line-angle': `${-45 + index * 30}deg`,
            '--line-delay': `${index * 0.1}s`,
          }}
          title={`Parent: ${parent.title}`}
        />
      ))}

      {/* Sibling connections - left and right */}
      {connectionLines.siblings.map((sibling, index) => {
        const calculateSiblingAngle = (index) => {
          if (isEven(index)) {
            return `${90 - index * 3}deg`
          } else {
            return `${180 + index * 3}deg`
          }
        }
        return (
          <div
            key={`sibling-${sibling.id}`}
            onClick={() => handleConnectionLineClick(sibling.id)}
            className={styles.connectionLine}
            style={{
              '--line-angle': calculateSiblingAngle(index),
              '--line-delay': `${index * 0.1}s`,
            }}
            title={`Sibling: ${sibling.title}`}
          />
        )
      })}

      {/* Child connections - bottom */}
      {connectionLines.children.map((child, index) => {
        // 45deg is directly down
        const nonZeroIndex = index + 1

        const calculateChildAngle = (index) => {
          if (isEven(index)) {
            return `${43 - index * 3}deg`
          } else {
            return `${47 + index * 3}deg`
          }
        }
        return (
          <div
            key={`child-${child.id}`}
            onClick={() => handleConnectionLineClick(child.id)}
            className={styles.connectionLine}
            style={{
              '--line-angle': `${calculateChildAngle(nonZeroIndex)}`,
              '--line-delay': `${nonZeroIndex * 0.1}s`,
            }}
            title={`Child: ${child.title}`}
          />
        )
      })}

      {/* External connections - Top angles */}
      {connectionLines.externals.map((external, index) => (
        <div
          key={`external-${external.id}`}
          className={`${styles.connectionLine} ${styles.externalLine}`}
          style={{
            '--line-angle': `${120 + index * 20}deg`,
            '--line-delay': `${index * 0.1}s`,
          }}
          title={`External: ${external.title}`}
        />
      ))}
    </div>
  )
}

export default ConnectionLines
