import classNames from 'classnames'
import React, { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import ShinyText from '@components/Shared/ShinyText/ShinyText'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

// Redux
import { createConnection } from '@redux/reducers/connectionsReducer'

import styles from './FormattedTextOverlay.module.scss'

const {
  FRONTEND: { EXTERNAL, SIBLING },
} = CONNECTION_TYPES

const { DIRECT } = CONNECTION_SOURCE_TYPES

const FormattedTextOverlay = ({ quillRef, toolbarVisible }) => {
  const [quillEditorScrollTopVal, setQuillEditorScrollTopVal] = useState(0)

  const { connections } = useSelector((state) => state.connections)
  const { content, entryId } = useSelector((state) => state.currentEntry)
  const history = useHistory()
  const nodeEntriesInfo = useNodeEntriesInfo()
  const dispatch = useDispatch()

  const allTitles = useMemo(() => nodeEntriesInfo?.map((x) => x?.title?.toLowerCase()) ?? [], [nodeEntriesInfo])

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
    return nodes.find((x) => x.title.toLowerCase() === title.toLowerCase()).id ?? null
  }

  const formattedContent = useMemo(() => {
    if (!content) return null

    const handleCreateSimpleSiblingConnection = async (nodes, word) => {
      await dispatch(
        createConnection({
          connection_type: SIBLING,
          main_entry_id: entryId,
          foreign_entry_id: findIdByNodeTitle(nodes, word),
          primary_entry_id: entryId,
          primary_source: word,
          foreign_source: word,
          source_type: DIRECT,
        })
      )
    }

    const formatKeys = Object.keys(formatRules)
    const allWords = [...new Set([...formatKeys, ...allTitles])]

    if (allWords.length === 0) {
      return content.split(/<\/p>\s*<p>/i).map((p, i) => <p key={i}>{p.replace(/<\/?p>/gi, '')}</p>)
    }

    const paragraphRegex = /<p>(.*?)<\/p>/gi
    const paragraphs = []
    let match

    while ((match = paragraphRegex.exec(content)) !== null) {
      paragraphs.push(match[1])
    }

    if (paragraphs.length === 0) {
      paragraphs.push(content)
    }

    const pattern = new RegExp(`\\b(${allWords.map(escapeRegExp).join('|')})\\b`, 'gi')

    return paragraphs.map((paragraph, i) => {
      const parts = []
      let lastIndex = 0

      let match
      while ((match = pattern.exec(paragraph)) !== null) {
        const before = paragraph.slice(lastIndex, match.index)
        if (before) parts.push(before)

        const word = match[0]
        const ruleKey = formatKeys.find((k) => k.toLowerCase() === word.toLowerCase())

        if (ruleKey) {
          parts.push(
            React.cloneElement(formatRules[ruleKey], {
              key: `${word}-${i}-${match.index}`,
            })
          )
        } else if (allTitles.includes(word.toLowerCase())) {
          parts.push(
            <ShinyText
              key={`${word}-${i}-${match.index}`}
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

      const after = paragraph.slice(lastIndex)
      if (after) parts.push(after)

      return <p key={i}>{parts}</p>
    })
  }, [content, formatRules, allTitles, dispatch, entryId, nodeEntriesInfo])

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor()

      const update = () => setQuillEditorScrollTopVal(quill.root.scrollTop)
      quill.root.addEventListener('scroll', update)

      return () => quill.root.removeEventListener('scroll', update)
    }
  }, [quillRef, quillEditorScrollTopVal])

  return (
    <div
      id="Formatted Text Overlay Boy"
      className={classNames(styles.wrapper, {
        [styles.toolbarVisible]: toolbarVisible,
      })}
      style={{ top: `${27 - quillEditorScrollTopVal}px` }}
    >
      {formattedContent}
    </div>
  )
}

export default FormattedTextOverlay

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
