import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import ShinyText from './ShinyText'
import styles from './ShinyTextSuggestionMenu.module.scss'

const ShinyTextSuggestionTrigger = ({ candidate, text, onDismiss, onCreateConnection }) => {
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState(null)

  const closeMenu = useCallback(() => {
    setMenuPosition(null)
  }, [])

  const openMenu = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()

    const rect = event.currentTarget.getBoundingClientRect()
    setMenuPosition({
      left: rect.left,
      top: rect.bottom + 6,
    })
  }, [])

  useEffect(() => {
    if (!menuPosition) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (menuRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) {
        return
      }
      closeMenu()
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuPosition, closeMenu])

  const handleDismiss = useCallback(() => {
    onDismiss?.(candidate)
    closeMenu()
  }, [candidate, onDismiss, closeMenu])

  const handleCreateConnection = useCallback(() => {
    onCreateConnection?.(candidate)
    closeMenu()
  }, [candidate, onCreateConnection, closeMenu])

  return (
    <>
      <ShinyText
        ref={triggerRef}
        text={text}
        onClick={openMenu}
        data-tooltip-id="main-tooltip"
        data-tooltip-content="Connection suggestion — click for options"
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            openMenu(event)
          }
        }}
      />
      {menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.menu}
            style={{ left: menuPosition.left, top: menuPosition.top }}
            role="menu"
          >
            <button type="button" className={styles.option} role="menuitem" onClick={handleCreateConnection}>
              Create connection
            </button>
            <button type="button" className={styles.option} role="menuitem" onClick={handleDismiss}>
              Remove suggestion
            </button>
          </div>,
          document.body
        )}
    </>
  )
}

export default ShinyTextSuggestionTrigger
