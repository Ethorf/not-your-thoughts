import React from 'react'
import ShinyText from '@components/Shared/ShinyText/ShinyText'
import { CONNECTION_TYPES } from '@constants/connectionTypes'

const {
  FRONTEND: { EXTERNAL, SIBLING },
} = CONNECTION_TYPES

// Helper function to escape regex special characters
function escapeRegExp(string) {
  return string?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Creates format rules from connections for highlighting connected text
 * @param {Array} connections - Array of connection objects
 * @param {string} entryId - Current entry ID
 * @param {Function} onInternalConnectionClick - Callback for internal connection clicks
 * @param {Function} onExternalConnectionClick - Optional callback for external connection clicks
 * @param {string} styles - CSS module styles object
 * @returns {Object} Rules object mapping connection sources to React elements
 */
export const createFormatRules = (
  connections,
  entryId,
  onInternalConnectionClick,
  onExternalConnectionClick = null,
  styles = {}
) => {
  const rules = {}

  connections?.forEach(({ primary_source, connection_type, foreign_entry_id, foreign_source }) => {
    if (connection_type === EXTERNAL && foreign_source) {
      const handleExternalClick = onExternalConnectionClick || ((url) => window.open(url, '_blank', 'noopener,noreferrer'))
      rules[primary_source] = (
        <a
          key={primary_source}
          data-tooltip-id="main-tooltip"
          data-tooltip-content="External Connection"
          href={foreign_source}
          target="_blank"
          className={styles.externalConnection}
          rel="noopener noreferrer"
          onClick={(e) => {
            if (onExternalConnectionClick) {
              e.preventDefault()
              handleExternalClick(foreign_source)
            }
          }}
        >
          {primary_source}
        </a>
      )
    } else if (connection_type === SIBLING && foreign_entry_id && foreign_entry_id !== entryId) {
      rules[primary_source] = (
        <span
          key={primary_source}
          data-tooltip-id="main-tooltip"
          data-tooltip-content="Internal connection"
          className={styles.internalConnection}
          onClick={() => onInternalConnectionClick(foreign_entry_id)}
          role="button"
          tabIndex={0}
          style={{ color: 'white' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onInternalConnectionClick(foreign_entry_id)
          }}
        >
          {primary_source}
        </span>
      )
    } else if ((connection_type === 'child' || connection_type === 'parent') && foreign_entry_id) {
      rules[primary_source] = (
        <span
          key={primary_source}
          data-tooltip-id="main-tooltip"
          data-tooltip-content={`${connection_type} connection`}
          className={styles.internalConnection}
          onClick={() => onInternalConnectionClick(foreign_entry_id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onInternalConnectionClick(foreign_entry_id)
          }}
        >
          {primary_source}
        </span>
      )
    }
  })

  return rules
}

/**
 * Finds a node ID by its title
 * @param {Array} nodes - Array of node entry objects
 * @param {string} title - Title to search for
 * @returns {string|null} Node ID or null if not found
 */
export const findIdByNodeTitle = (nodes, title) => {
  return nodes.find((x) => x.title.toLowerCase() === title.toLowerCase())?.id ?? null
}

/**
 * Transforms HTML content with connection highlighting
 * @param {string} content - HTML content string
 * @param {Object} formatRules - Rules object from createFormatRules
 * @param {Array} allTitles - Array of all node titles (lowercase)
 * @param {Function} onUnconnectedNodeClick - Callback for clicking on nodes without connections
 * @param {Array} nodeEntriesInfo - Array of node entry objects
 * @param {string} unconnectedNodeTooltip - Tooltip text for unconnected nodes (default: "node found, click to view")
 * @returns {Array} Array of React elements representing formatted content
 */
export const formatContentWithConnections = (
  content,
  formatRules,
  allTitles,
  onUnconnectedNodeClick = null,
  nodeEntriesInfo = [],
  unconnectedNodeTooltip = 'node found, click to view'
) => {
  if (!content) return null

  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')

  const formatKeys = Object.keys(formatRules)
  const allWords = [...new Set([...formatKeys, ...allTitles])]
  const pattern = new RegExp(`\\b(${allWords.map(escapeRegExp).join('|')})\\b`, 'gi')

  // Helper function to check if content is empty or only whitespace
  const isEmptyContent = (content) => {
    if (Array.isArray(content)) {
      if (content.length === 0) return true
      // Check if all items are empty strings or null
      const hasNonEmptyContent = content.some((item) => {
        if (typeof item === 'string') {
          return item.trim() !== ''
        }
        // Keep React elements as they may have visual presence (e.g., ShinyText, links)
        if (React.isValidElement(item)) {
          return true
        }
        return item != null
      })
      return !hasNonEmptyContent
    }
    if (typeof content === 'string') {
      return content.trim() === ''
    }
    return !content
  }

  const transformNode = (node, paragraphIndex) => {
    if (!node) return null

    // TEXT NODE
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const parts = []
      let lastIndex = 0
      pattern.lastIndex = 0 // reset regex state

      let match
      while ((match = pattern.exec(node.textContent)) !== null) {
        // Avoid infinite loops from zero-width matches
        if (match.index === pattern.lastIndex) {
          pattern.lastIndex++
          continue
        }

        const before = node.textContent.slice(lastIndex, match.index)
        if (before) parts.push(before)

        const word = match[0]
        const ruleKey = formatKeys.find((k) => k.toLowerCase() === word.toLowerCase())

        if (ruleKey) {
          parts.push(
            React.cloneElement(formatRules[ruleKey], {
              key: `${word}-${paragraphIndex}-${match.index}`,
            })
          )
        } else if (allTitles.includes(word.toLowerCase()) && onUnconnectedNodeClick) {
          // Show ShinyText for nodes that don't have connections
          parts.push(
            <ShinyText
              key={`${word}-${paragraphIndex}-${match.index}`}
              onClick={() => {
                const nodeId = findIdByNodeTitle(nodeEntriesInfo, word)
                if (nodeId) {
                  onUnconnectedNodeClick(nodeId)
                }
              }}
              text={word}
              data-tooltip-id="main-tooltip"
              data-tooltip-content={unconnectedNodeTooltip}
            />
          )
        } else {
          parts.push(word)
        }

        lastIndex = match.index + word.length
      }

      const after = node.textContent.slice(lastIndex)
      if (after) parts.push(after)

      return parts
    }

    // ELEMENT NODE
    if (node.nodeType === Node.ELEMENT_NODE) {
      const children = safeTransformChildren(node.childNodes, paragraphIndex)

      if (!node.tagName) return children

      switch (node.tagName.toLowerCase()) {
        case 'strong':
          return <strong key={`${paragraphIndex}-${Math.random()}`}>{children}</strong>
        case 'em':
          return <em key={`${paragraphIndex}-${Math.random()}`}>{children}</em>
        case 'u':
          return <u key={`${paragraphIndex}-${Math.random()}`}>{children}</u>
        case 's':
        case 'del':
          return <s key={`${paragraphIndex}-${Math.random()}`}>{children}</s>
        case 'ul':
          return <ul key={`${paragraphIndex}-${Math.random()}`}>{children}</ul>
        case 'ol':
          return <ol key={`${paragraphIndex}-${Math.random()}`}>{children}</ol>
        case 'li':
          return <li key={`${paragraphIndex}-${Math.random()}`}>{children}</li>
        case 'p':
          // Skip empty paragraphs (Quill often generates empty <p> tags for formatting)
          if (isEmptyContent(children)) {
            return null
          }
          return <p key={`${paragraphIndex}-${Math.random()}`}>{children}</p>
        default:
          return children
      }
    }

    return null
  }

  const safeTransformChildren = (childNodes, paragraphIndex) => {
    const result = []

    if (!childNodes || !childNodes.length) return result

    for (const child of childNodes) {
      try {
        const transformed = transformNode(child, paragraphIndex)
        if (Array.isArray(transformed)) {
          result.push(...transformed)
        } else if (transformed != null) {
          result.push(transformed)
        }
      } catch (e) {
        console.warn('Error transforming child node:', e, child)
      }
    }

    return result
  }

  const rootChildren = Array.from(doc.body.childNodes)

  return rootChildren.map((node, i) => transformNode(node, i))
}

