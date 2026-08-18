import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import menuStyles from '@components/Shared/ShinyText/ShinyTextSuggestionMenu.module.scss'

const JournalSelectionMenu = ({ menuState, onCreateNode, onClose }) => {
  const menuRef = useRef(null)

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
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuState, onClose])

  if (!menuState) {
    return null
  }

  return createPortal(
    <div ref={menuRef} className={menuStyles.menu} style={{ left: menuState.left, top: menuState.top }} role="menu">
      <button type="button" className={menuStyles.option} role="menuitem" onClick={onCreateNode}>
        Create node from selection
      </button>
    </div>,
    document.body
  )
}

export default JournalSelectionMenu
