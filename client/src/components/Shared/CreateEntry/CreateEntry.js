import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'

// Redux
import { setContent, setWordCount, setCharCount } from '@redux/reducers/currentEntryReducer'

import { ENTRY_TYPES } from '@constants/entryTypes'

// Styles
import styles from './CreateEntry.module.scss'
import './CustomQuillStyles.scss'

// === 1. Define Custom Inline Blots ===
const Inline = Quill.import('blots/inline')

class HighlightBlot extends Inline {
  static blotName = 'highlight'
  static tagName = 'span' // default tag is span

  static create(value) {
    // If a link is provided, create an anchor element; otherwise, use the default element
    const node = value.href ? document.createElement('a') : super.create()

    if (value.color) {
      node.style.color = value.color
    }
    if (value.fontWeight) {
      node.style.fontWeight = value.fontWeight
    }
    if (value.textDecoration) {
      node.style.textDecoration = value.textDecoration
    }
    if (value.href) {
      node.setAttribute('href', value.href)
      node.setAttribute('target', '_blank')
      node.style.cursor = 'pointer'
      // Optionally, ensure the link has the specified color or a default one
      if (!value.color) {
        node.style.color = 'blue'
      }
    }
    return node
  }

  static formats(node) {
    return {
      color: node.style.color || null,
      fontWeight: node.style.fontWeight || null,
      textDecoration: node.style.textDecoration || null,
      href: node.getAttribute('href') || null,
    }
  }
}

Quill.register(HighlightBlot)

const CreateEntry = ({ type }) => {
  const dispatch = useDispatch()
  const quillRef = useRef(null)

  const { content, entriesLoading, entryId } = useSelector((state) => state.currentEntry)
  const { sidebarOpen } = useSelector((state) => state.sidebar)
  const { connections } = useSelector((state) => state.connections)

  const [toolbarVisible, setToolbarVisible] = useState(false)

  const setTotalWordCount = () => {
    const wordsAmount = content?.split(/\s+/).filter((word) => word?.length > 0)
    wordsAmount?.length && dispatch(setWordCount(wordsAmount?.length))
    content?.length && dispatch(setCharCount(content?.length))
  }

  const handleContentChange = (e) => {
    dispatch(setContent(e))
    setTotalWordCount()
  }

  useEffect(() => {
    setTotalWordCount()
  }, [entryId])

  const PLACEHOLDER_COPY = {
    [ENTRY_TYPES.NODE]: 'Start node here...',
    [ENTRY_TYPES.JOURNAL]: 'Note those thoughts here...',
  }

  const toolBarModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ],
  }

  useEffect(() => {
    if (!sidebarOpen && quillRef.current) {
      const quill = quillRef.current.getEditor()
      quill.focus()
      const length = quill.getLength()
      quill.setSelection(length, length)
    }
  }, [sidebarOpen])

  useEffect(() => {
    if (!quillRef.current || !connections?.length) return

    const quill = quillRef.current.getEditor()
    const text = quill.getText() // Get plain text content
    if (!text.trim()) return

    // Categorize words based on their styling rules
    const wordStyles = {}
    connections.forEach((conn) => {
      if (conn.type === 'red') {
        wordStyles[conn.primary_source] = { color: 'red', fontWeight: 'bold' }
      } else if (conn.type === 'blue') {
        wordStyles[conn.primary_source] = { color: 'blue', fontWeight: 'bold' }
      } else if (conn.connection_type === 'external' && conn.foreign_source) {
        wordStyles[conn.primary_source] = { color: 'blue', href: conn.foreign_source, textDecoration: 'underline' }
      }
    })

    console.log('Applying styles to text:', wordStyles)

    const regexPattern = Object.keys(wordStyles).length
      ? new RegExp(`(${Object.keys(wordStyles).join('|')})`, 'gi')
      : null

    if (!regexPattern) return

    const delta = quill.getContents()
    let newDelta = []

    delta.ops.forEach((op) => {
      if (typeof op.insert === 'string') {
        let text = op.insert
        let match
        let lastIndex = 0
        let formattedOps = []

        while ((match = regexPattern.exec(text))) {
          const matchedWord = match[0]
          const beforeText = text.substring(lastIndex, match.index)

          if (beforeText) {
            formattedOps.push({ insert: beforeText })
          }

          formattedOps.push({
            insert: matchedWord,
            attributes: { highlight: wordStyles[matchedWord] },
          })

          lastIndex = regexPattern.lastIndex
        }

        if (lastIndex < text.length) {
          formattedOps.push({ insert: text.substring(lastIndex) })
        }

        newDelta.push(...formattedOps)
      } else {
        newDelta.push(op)
      }
    })

    quill.setContents({ ops: newDelta })
  }, [connections])

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor()
      const handleClick = (e) => {
        if (e.target && e.target.tagName === 'A') {
          e.preventDefault()
          window.open(e.target.getAttribute('href'), '_blank')
        }
      }
      quill.root.addEventListener('click', handleClick)
      return () => {
        quill.root.removeEventListener('click', handleClick)
      }
    }
  }, [quillRef])

  return (
    <div className={styles.wrapper}>
      {entriesLoading ? (
        <SmallSpinner />
      ) : (
        <>
          <ReactQuill
            className={`textArea ${toolbarVisible ? 'toolbar-visible' : 'toolbar-hidden'} ${
              type === ENTRY_TYPES.JOURNAL ? 'noScroll' : ''
            }`}
            modules={toolBarModules}
            placeholder={PLACEHOLDER_COPY[type]}
            value={content}
            onChange={handleContentChange}
            ref={quillRef}
          />
          <TextButton
            className={styles.toolbarToggleButton}
            tooltip={'Toggle formatting toolbar'}
            onClick={() => setToolbarVisible(!toolbarVisible)}
          >
            {toolbarVisible ? 'X' : '+'}
          </TextButton>
        </>
      )}
    </div>
  )
}

export default CreateEntry
