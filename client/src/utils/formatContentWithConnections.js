import React from 'react'
import ShinyText from '@components/Shared/ShinyText/ShinyText'
import ShinyTextSuggestionTrigger from '@components/Shared/ShinyText/ShinyTextSuggestionTrigger'
import { CONNECTION_TYPES } from '@constants/connectionTypes'

const {
  FRONTEND: { EXTERNAL },
} = CONNECTION_TYPES

/**
 * Resolves the other node's id for an internal connection relative to the current entry.
 */
export const resolveConnectedNodeId = (connection, entryId) => {
  if (!connection || connection.connection_type === EXTERNAL) {
    return null
  }

  const entryIdNum = Number(entryId)
  const primaryId = Number(connection.primary_entry_id)
  const foreignId = Number(connection.foreign_entry_id)

  if (!Number.isFinite(entryIdNum)) {
    return foreignId || primaryId || null
  }

  if (primaryId === entryIdNum && foreignId) {
    return foreignId
  }
  if (foreignId === entryIdNum && primaryId) {
    return primaryId
  }
  if (foreignId && foreignId !== entryIdNum) {
    return foreignId
  }

  return primaryId || null
}

/**
 * Resolves display title for the node connected on the other end of an internal connection.
 */
export const resolveConnectedNodeTitle = (connection, entryId, nodeEntriesInfo = []) => {
  const connectedId = resolveConnectedNodeId(connection, entryId)
  if (!connectedId) {
    return null
  }

  const nodeFromList = nodeEntriesInfo.find((node) => Number(node.id) === Number(connectedId))
  if (nodeFromList?.title) {
    return nodeFromList.title
  }

  if (Number(connection.foreign_entry_id) === Number(connectedId)) {
    return connection.foreign_entry_title || connection.foreign_source || null
  }

  return connection.primary_entry_title || connection.primary_source || null
}

const normalizeInternalConnectionTypeLabel = (connectionType) => {
  const normalized = connectionType?.toLowerCase()

  if (normalized === 'horizontal') {
    return 'sibling'
  }

  if (normalized === 'vertical') {
    return 'vertical'
  }

  if (normalized === 'sibling' || normalized === 'child' || normalized === 'parent') {
    return normalized
  }

  return 'unknown'
}

const getInternalConnectionTooltip = (connectionType) => {
  const typeLabel = normalizeInternalConnectionTypeLabel(connectionType)
  return `internal ${typeLabel} connection`
}

const createInternalConnectionElement = ({
  displayText,
  targetNodeId,
  connectionType,
  onInternalConnectionClick,
  styles,
}) => (
  <span
    key={`${displayText}-${targetNodeId}`}
    data-tooltip-id="main-tooltip"
    data-tooltip-content={getInternalConnectionTooltip(connectionType)}
    className={styles.internalConnection}
    onClick={() => onInternalConnectionClick(targetNodeId)}
    role="button"
    tabIndex={0}
    style={{ color: 'white' }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') onInternalConnectionClick(targetNodeId)
    }}
  >
    {displayText}
  </span>
)

// Helper function to escape regex special characters
function escapeRegExp(string) {
  return string?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Store styles reference for use in formatContentWithConnections
let currentStyles = {}

/**
 * Creates format rules from connections for highlighting connected text
 * @param {Array} connections - Array of connection objects
 * @param {string} entryId - Current entry ID
 * @param {Function} onInternalConnectionClick - Callback for internal connection clicks
 * @param {Function} onExternalConnectionClick - Optional callback for external connection clicks
 * @param {Object} styles - CSS module styles object
 * @param {Array} nodeEntriesInfo - Node list for resolving connected titles by entry id
 * @returns {Object} Rules object mapping connection sources to React elements
 */
export const createFormatRules = (
  connections,
  entryId,
  onInternalConnectionClick,
  onExternalConnectionClick = null,
  styles = {},
  nodeEntriesInfo = []
) => {
  // Store styles for use in formatContentWithConnections
  currentStyles = styles
  const rules = {}

  const addRule = (sourceText, element) => {
    if (!sourceText || rules[sourceText]) {
      return
    }
    rules[sourceText] = element
  }

  connections?.forEach((connection) => {
    const { primary_source: primarySource, connection_type: connectionType, foreign_source: foreignSource } = connection

    if (connectionType === EXTERNAL && foreignSource) {
      const handleExternalClick = onExternalConnectionClick || ((url) => window.open(url, '_blank', 'noopener,noreferrer'))
      addRule(
        primarySource,
        (
          <a
            key={primarySource}
            data-tooltip-id="main-tooltip"
            data-tooltip-content="External Connection"
            href={foreignSource}
            target="_blank"
            className={styles.externalConnection}
            rel="noopener noreferrer"
            onClick={(e) => {
              if (onExternalConnectionClick) {
                e.preventDefault()
                handleExternalClick(foreignSource)
              }
            }}
          >
            {primarySource}
          </a>
        )
      )
      return
    }

    const connectedNodeId = resolveConnectedNodeId(connection, entryId)
    if (!connectedNodeId) {
      return
    }

    const connectedTitle = resolveConnectedNodeTitle(connection, entryId, nodeEntriesInfo)
    const internalElementFactory = (displayText) =>
      createInternalConnectionElement({
        displayText,
        targetNodeId: connectedNodeId,
        connectionType,
        onInternalConnectionClick,
        styles,
      })

    if (connectedTitle) {
      addRule(connectedTitle, internalElementFactory(connectedTitle))
    }

    if (primarySource && (!connectedTitle || primarySource.toLowerCase() !== connectedTitle.toLowerCase())) {
      addRule(primarySource, internalElementFactory(primarySource))
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
 * @param {boolean} enableShinyText - Whether to show ShinyText for unconnected nodes (default: true)
 * @param {Object|null} shinyTextOptions - Optional shiny suggestion menu config
 * @param {string|number} [shinyTextOptions.entryId] - Current entry id for stable animation phases
 * @param {Map<string, Object>} shinyTextOptions.candidateMap - titleLower -> candidate
 * @param {Function} shinyTextOptions.onDismiss - dismiss handler(candidate)
 * @param {Function} shinyTextOptions.onCreateConnection - create connection handler(candidate, connectionType, matchedText)
 * @returns {Array} Array of React elements representing formatted content
 */
export const formatContentWithConnections = (
  content,
  formatRules,
  allTitles,
  onUnconnectedNodeClick = null,
  nodeEntriesInfo = [],
  unconnectedNodeTooltip = 'node found, click to view',
  enableShinyText = true,
  shinyTextOptions = null
) => {
  if (!content) return null

  const shinyCandidateMap = shinyTextOptions?.candidateMap ?? null
  const shinyEntryId = shinyTextOptions?.entryId ?? null
  const onDismissShinySuggestion = shinyTextOptions?.onDismiss ?? null
  const onCreateConnectionFromSuggestion = shinyTextOptions?.onCreateConnection ?? null
  const useShinySuggestionMenu = Boolean(
    shinyCandidateMap && onDismissShinySuggestion && onCreateConnectionFromSuggestion
  )
  const shinyOccurrenceCounts = new Map()

  const getShinyInstanceIds = (titleLower, paragraphIndex, candidateId = null) => {
    const countKey = `${paragraphIndex}:${titleLower}`
    const occurrence = shinyOccurrenceCounts.get(countKey) ?? 0
    shinyOccurrenceCounts.set(countKey, occurrence + 1)

    const elementKey = `shiny-${titleLower}-p${paragraphIndex}-o${occurrence}`
    const identity = candidateId ?? titleLower
    const animationId = shinyEntryId
      ? `${shinyEntryId}:${identity}:p${paragraphIndex}:o${occurrence}`
      : `${identity}:p${paragraphIndex}:o${occurrence}`

    return { elementKey, animationId }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')

  const formatKeys = Object.keys(formatRules)
  const allWords = [...new Set([...formatKeys, ...allTitles])]
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

  const pattern = new RegExp(`\\b(${allWords.map(escapeRegExp).join('|')})\\b`, 'gi')

  const getPreservedClassName = (node) => {
    const className = node.getAttribute?.('class')
    return className || undefined
  }

  const isBreakOnlyElement = (node) => {
    if (!node?.childNodes?.length) {
      return false
    }

    const meaningfulChildren = Array.from(node.childNodes).filter((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        return child.textContent?.trim()
      }
      return true
    })

    if (meaningfulChildren.length !== 1) {
      return false
    }

    const onlyChild = meaningfulChildren[0]
    return onlyChild.nodeType === Node.ELEMENT_NODE && onlyChild.tagName === 'BR'
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
              children: word,
            })
          )
        } else if (allTitles.includes(word.toLowerCase())) {
          const titleLower = word.toLowerCase()
          const shinyCandidate = shinyCandidateMap?.get(titleLower)

          if (shinyCandidate?.isDismissed) {
            parts.push(word)
          } else if (useShinySuggestionMenu && shinyCandidate) {
            const { elementKey, animationId } = getShinyInstanceIds(
              titleLower,
              paragraphIndex,
              shinyCandidate.id
            )
            parts.push(
              <ShinyTextSuggestionTrigger
                key={elementKey}
                candidate={shinyCandidate}
                text={word}
                animationId={animationId}
                onDismiss={onDismissShinySuggestion}
                onCreateConnection={onCreateConnectionFromSuggestion}
              />
            )
          } else if (enableShinyText && onUnconnectedNodeClick) {
            const { elementKey, animationId } = getShinyInstanceIds(titleLower, paragraphIndex)
            parts.push(
              <ShinyText
                key={elementKey}
                animationId={animationId}
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
          } else if (onUnconnectedNodeClick) {
            // Plain clickable text for unconnected nodes when shiny text is disabled
            const nodeId = findIdByNodeTitle(nodeEntriesInfo, word)
            parts.push(
              <span
                key={`${word}-${paragraphIndex}-${match.index}`}
                onClick={() => {
                  if (nodeId) {
                    onUnconnectedNodeClick(nodeId)
                  }
                }}
                style={{ cursor: 'pointer' }}
                data-tooltip-id="main-tooltip"
                data-tooltip-content={unconnectedNodeTooltip}
              >
                {word}
              </span>
            )
          } else {
            parts.push(word)
          }
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
        case 'li': {
          const className = getPreservedClassName(node)
          if (
            node.childNodes?.length === 1 &&
            node.firstChild?.nodeType === Node.ELEMENT_NODE &&
            node.firstChild.tagName === 'P' &&
            isBreakOnlyElement(node.firstChild)
          ) {
            return (
              <li key={`${paragraphIndex}-${Math.random()}`} className={className}>
                <br />
              </li>
            )
          }
          if (isBreakOnlyElement(node)) {
            return (
              <li key={`${paragraphIndex}-${Math.random()}`} className={className}>
                <br />
              </li>
            )
          }
          return (
            <li key={`${paragraphIndex}-${Math.random()}`} className={className}>
              {children}
            </li>
          )
        }
        case 'p': {
          const className = getPreservedClassName(node)
          if (isBreakOnlyElement(node)) {
            return (
              <p key={`${paragraphIndex}-${Math.random()}`} className={className}>
                <br />
              </p>
            )
          }
          // Skip empty paragraphs (Quill often generates empty <p> tags for formatting)
          if (isEmptyContent(children)) {
            return null
          }
          return (
            <p key={`${paragraphIndex}-${Math.random()}`} className={className}>
              {children}
            </p>
          )
        }
        case 'a':
          // Handle anchor tags with proper external connection styling
          const href = node.getAttribute('href')
          return (
            <a
              key={`${paragraphIndex}-${Math.random()}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={currentStyles.externalConnection}
              data-tooltip-id="main-tooltip"
              data-tooltip-content="External link"
            >
              {children}
            </a>
          )
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

