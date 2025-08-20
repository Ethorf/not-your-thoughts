import React, { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import ShinyText from '@components/Shared/ShinyText/ShinyText'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

// Redux
import { createConnection } from '@redux/reducers/connectionsReducer'

import styles from './FormattedTextOverlay.module.scss'

const {
  FRONTEND: { EXTERNAL, SIBLING },
} = CONNECTION_TYPES

const { DIRECT } = CONNECTION_SOURCE_TYPES

// const MAIN_TOP_OFFSET = 16
const MAIN_TOP_OFFSET = 0

const FormattedTextOverlay = ({ quillRef, toolbarVisible }) => {
  const [quillEditorScrollTopVal, setQuillEditorScrollTopVal] = useState(0)
  const [hasScrollbar, setHasScrollbar] = useState(false)

  const { connections } = useSelector((state) => state.connections)
  const { content, entryId, title: currentTitle } = useSelector((state) => state.currentEntry)
  const history = useHistory()
  const nodeEntriesInfo = useNodeEntriesInfo()
  const dispatch = useDispatch()

  const allTitles = useMemo(
    () => nodeEntriesInfo?.map((x) => x?.title?.toLowerCase()).filter((t) => t !== currentTitle.toLowerCase()) ?? [],
    [currentTitle, nodeEntriesInfo]
  )

  const formatRules = useMemo(() => {
    const rules = {}

    const handleRedirectToNode = (id) => {
      history.push(`/edit-node-entry?entryId=${id}`)
    }

    connections?.forEach(({ primary_source, connection_type, foreign_entry_id, foreign_source }) => {
      if (connection_type === EXTERNAL && foreign_source) {
        rules[primary_source] = (
          <a
            key={primary_source}
            data-tooltip-id="main-tooltip"
            data-tooltip-content="External Connection"
            href={foreign_source}
            target="_blank"
            className={styles.externalConnection}
            rel="noopener noreferrer"
          >
            {primary_source}
          </a>
        )
      } else if (connection_type === SIBLING && foreign_entry_id) {
        rules[primary_source] = (
          <span
            key={primary_source}
            data-tooltip-id="main-tooltip"
            data-tooltip-content="Internal connection"
            className={styles.internalConnection}
            onClick={() => handleRedirectToNode(foreign_entry_id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRedirectToNode(foreign_entry_id)
            }}
          >
            {primary_source}
          </span>
        )
      }
    })

    return rules
  }, [connections, history])

  const findIdByNodeTitle = (nodes, title) => {
    return nodes.find((x) => x.title.toLowerCase() === title.toLowerCase())?.id ?? null
  }

  const formattedContent = useMemo(() => {
    if (!content) return null

    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')

    const formatKeys = Object.keys(formatRules)
    const allWords = [...new Set([...formatKeys, ...allTitles])]
    const pattern = new RegExp(`\\b(${allWords.map(escapeRegExp).join('|')})\\b`, 'gi')

    const handleCreateSimpleSiblingConnection = async (nodes, word) => {
      await dispatch(
        createConnection({
          connection_type: SIBLING,
          current_entry_id: entryId,
          foreign_entry_id: findIdByNodeTitle(nodes, word),
          primary_entry_id: entryId,
          primary_source: word,
          foreign_source: word,
          source_type: DIRECT,
        })
      )
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
          } else if (allTitles.includes(word.toLowerCase())) {
            parts.push(
              <ShinyText
                key={`${word}-${paragraphIndex}-${match.index}`}
                onClick={() => handleCreateSimpleSiblingConnection(nodeEntriesInfo, word)}
                text={word}
                data-tooltip-id="main-tooltip"
                data-tooltip-content="node found, click to create connection"
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
  }, [content, formatRules, allTitles, dispatch, entryId, nodeEntriesInfo])

  const initialTopValue = toolbarVisible ? 41 + MAIN_TOP_OFFSET : MAIN_TOP_OFFSET

  // Mostly event listeners and scroll stuff
  useEffect(() => {
    if (!quillRef.current) return

    const quill = quillRef.current.getEditor()
    const root = quill.root

    const update = () => {
      setQuillEditorScrollTopVal(root.scrollTop)
      setHasScrollbar(root.scrollHeight > root.clientHeight)
    }

    const rafUpdate = () => {
      requestAnimationFrame(update)
    }

    root.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    const resizeObserver = new ResizeObserver(rafUpdate)
    resizeObserver.observe(root)

    update()

    const contentTimeout = setTimeout(() => {
      update()
    }, 250)

    return () => {
      root.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      resizeObserver.disconnect()
      clearTimeout(contentTimeout)
    }
  }, [quillRef, content])

  return (
    <div
      id="Formatted Text Overlay Boy"
      className={styles.wrapper}
      style={{
        top: `${initialTopValue - quillEditorScrollTopVal}px`,
        paddingRight: `${hasScrollbar ? 46 + 12 : 46}px`,
      }}
    >
      {formattedContent}
    </div>
  )
}

export default FormattedTextOverlay

function escapeRegExp(string) {
  return string?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
