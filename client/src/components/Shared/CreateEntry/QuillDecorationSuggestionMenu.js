import React, { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { CONNECTION_TYPES } from '@constants/connectionTypes'

import menuStyles from '@components/Shared/ShinyText/ShinyTextSuggestionMenu.module.scss'

const {
  FRONTEND: { SIBLING, PARENT, CHILD },
} = CONNECTION_TYPES

const CONNECTION_MENU_OPTIONS = [
  { type: SIBLING, label: 'Create sibling connection' },
  { type: PARENT, label: 'Create parent connection' },
  { type: CHILD, label: 'Create child connection' },
]

const QuillDecorationSuggestionMenu = ({ menuState, candidate, matchedText, onDismiss, onCreateConnection, onClose }) => {
  const menuRef = useRef(null)

  const handleDismiss = useCallback(() => {
    if (candidate) {
      onDismiss?.(candidate)
    }
    onClose?.()
  }, [candidate, onDismiss, onClose])

  const handleCreateConnection = useCallback(
    (connectionType) => {
      if (candidate) {
        onCreateConnection?.(candidate, connectionType, matchedText)
      }
      onClose?.()
    },
    [candidate, matchedText, onCreateConnection, onClose]
  )

  useEffect(() => {
    if (!menuState) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) {
        return
      }
      onClose?.()
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuState, onClose])

  if (!menuState || !candidate) {
    return null
  }

  return createPortal(
    <div
      ref={menuRef}
      className={menuStyles.menu}
      style={{ left: menuState.left, top: menuState.top }}
      role="menu"
    >
      {CONNECTION_MENU_OPTIONS.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          className={menuStyles.option}
          role="menuitem"
          onClick={() => handleCreateConnection(type)}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        className={`${menuStyles.option} ${menuStyles.dismissOption}`}
        role="menuitem"
        onClick={handleDismiss}
      >
        Remove suggestion
      </button>
    </div>,
    document.body
  )
}

export default QuillDecorationSuggestionMenu
