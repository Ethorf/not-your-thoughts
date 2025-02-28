import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import styles from './FormattedTextOverlay.module.scss'

const FormattedTextOverlay = ({ toolbarVisible }) => {
  const { connections } = useSelector((state) => state.connections)
  const overlayRef = useRef(null)
  const { content } = useSelector((state) => state.currentEntry)
  const [formatRules, setFormatRules] = useState({})
  const [formattedContent, setFormattedContent] = useState(content)

  useEffect(() => {
    const newFormatRules = {}
    connections.forEach(({ primary_source, type, connection_type, foreign_source }) => {
      if (connection_type === 'external' && foreign_source) {
        newFormatRules[
          primary_source
        ] = `<a href="${foreign_source}" target="_blank" style="color: blue; text-decoration: underline; cursor: pointer;">${primary_source}</a>`
      } else if (type === 'red') {
        newFormatRules[primary_source] = `<span style="color: red; font-weight: bold;">${primary_source}</span>`
      } else if (type === 'blue') {
        newFormatRules[primary_source] = `<span style="color: blue; font-weight: bold;">${primary_source}</span>`
      }
    })
    setFormatRules(newFormatRules)
  }, [connections])

  useEffect(() => {
    let updatedContent = content
    Object.entries(formatRules).forEach(([word, replacement]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      updatedContent = updatedContent.replace(regex, replacement)
    })
    setFormattedContent(updatedContent)
  }, [content, formatRules])

  return (
    <div
      className={classNames(styles.wrapper, { [styles.toolbarVisible]: toolbarVisible })}
      ref={overlayRef}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  )
}

export default FormattedTextOverlay
