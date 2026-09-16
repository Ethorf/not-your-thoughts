import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import menuStyles from '@components/Shared/ShinyText/ShinyTextSuggestionMenu.module.scss'

/**
 * Right-click / selection popover for Quill editor actions.
 * @param {{ left: number, top: number } | null} menuState
 * @param {{ id: string, label: string, onClick: () => void, danger?: boolean }[]} options
 * @param {React.RefObject<HTMLElement>} [anchorRef] Clicks on this element do not dismiss the menu.
 */
const EditorSelectionContextMenu = ({ menuState, options = [], onClose, anchorRef }) => {
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuState) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) {
        return
      }
      if (anchorRef?.current?.contains(event.target)) {
        return
      }
      onClose?.()
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    // Capture phase so we close before other editor handlers clear selection UI.
    document.addEventListener('mousedown', handlePointerDown, true)
    document.addEventListener('touchstart', handlePointerDown, true)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true)
      document.removeEventListener('touchstart', handlePointerDown, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [anchorRef, menuState, onClose])

  if (!menuState || !options.length) {
    return null
  }

  const menuWidth = 220
  const left = Math.min(Math.max(8, menuState.left), window.innerWidth - menuWidth - 8)
  const top = Math.min(Math.max(8, menuState.top), window.innerHeight - 96)

  return createPortal(
    <div ref={menuRef} className={menuStyles.menu} style={{ left, top }} role="menu">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`${menuStyles.option}${option.danger ? ` ${menuStyles.dismissOption}` : ''}`}
          role="menuitem"
          onClick={() => {
            option.onClick?.()
            onClose?.()
          }}
        >
          {option.label}
        </button>
      ))}
    </div>,
    document.body
  )
}

export default EditorSelectionContextMenu
