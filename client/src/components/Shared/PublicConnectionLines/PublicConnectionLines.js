import React, { useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useHistory } from 'react-router-dom'
import { transformConnection } from '@utils/transformConnection'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import styles from './PublicConnectionLines.module.scss'

const { PARENT, CHILD, SIBLING, EXTERNAL } = CONNECTION_TYPES.FRONTEND

const PublicConnectionLines = ({
  entryId,
  userId,
  connections = [],
  convergencePoint = { top: '50%', left: '50%' },
}) => {
  const history = useHistory()
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 })

  const handleConnectionLineClick = (id) => {
    if (userId && id) {
      history.push(`/show-node-entry?userId=${userId}&entryId=${id}`)
    }
  }

  // Helper function to extract text from HTML
  const extractTextFromHTML = (html) => {
    if (!html) return ''
    if (typeof html !== 'string') return String(html)

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  // Map connection types to tooltip prefixes
  const getConnectionTypePrefix = (type) => {
    switch (type) {
      case PARENT:
        return 'View Parent Node: '
      case CHILD:
        return 'View Child Node: '
      case SIBLING:
        return 'View Sibling Node: '
      case EXTERNAL:
        return 'External Link: '
      default:
        return ''
    }
  }

  const handleMouseEnter = useCallback((connectionType, content) => {
    return (e) => {
      const prefix = getConnectionTypePrefix(connectionType)
      const textContent = extractTextFromHTML(content)
      const tooltipText = `${prefix}${textContent}`

      setTooltip({
        visible: true,
        content: tooltipText,
        x: e.clientX,
        y: e.clientY + 10,
      })
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 })
  }, [])

  // Group connections by type for rendering lines
  const connectionLines = useMemo(() => {
    if (!connections || !entryId || connections.length === 0) {
      return { parents: [], children: [], siblings: [], externals: [] }
    }

    const grouped = connections.reduce((acc, conn) => {
      const transformed = transformConnection(entryId, conn)
      const type = transformed.connection_type || conn.connection_type
      const url = conn.foreign_source

      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push({ ...transformed, url })
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

  return (
    <div
      className={styles.connectionLinesWrapper}
      style={{
        '--convergence-top': convergencePoint.top,
        '--convergence-left': convergencePoint.left,
      }}
    >
      {/* Parent connections - top */}
      {connectionLines.parents.map((parent, index) => (
        <div
          key={`parent-${parent.id}`}
          onClick={() => handleConnectionLineClick(parent.id)}
          className={styles.connectionLine}
          onMouseEnter={handleMouseEnter(PARENT, parent.title)}
          onMouseLeave={handleMouseLeave}
          style={{
            '--line-angle': `${-45 + index * 30}deg`,
            '--line-delay': `${index * 0.1}s`,
          }}
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
            onMouseEnter={handleMouseEnter(SIBLING, sibling.title)}
            onMouseLeave={handleMouseLeave}
            style={{
              '--line-angle': calculateSiblingAngle(index),
              '--line-delay': `${index * 0.1}s`,
            }}
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
            onMouseEnter={handleMouseEnter(CHILD, child.title)}
            onMouseLeave={handleMouseLeave}
            style={{
              '--line-angle': `${calculateChildAngle(nonZeroIndex)}`,
              '--line-delay': `${nonZeroIndex * 0.1}s`,
            }}
          />
        )
      })}

      {/* External connections - Top angles */}
      {connectionLines.externals.map((external, index) => (
        <div
          key={`external-${external.id}`}
          className={`${styles.connectionLine} ${styles.externalLine}`}
          onMouseEnter={handleMouseEnter(EXTERNAL, external.title)}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            if (external.url) {
              window.open(external.url, '_blank', 'noopener,noreferrer')
            }
          }}
          style={{
            '--line-angle': `${120 + index * 20}deg`,
            '--line-delay': `${index * 0.1}s`,
          }}
        />
      ))}

      {/* Custom cursor-following tooltip - rendered via portal to ensure it's above everything */}
      {tooltip.visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={styles.customTooltip}
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 20,
            }}
          >
            {tooltip.content}
          </div>,
          document.body
        )}
    </div>
  )
}

export default PublicConnectionLines
