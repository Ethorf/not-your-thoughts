import { useState, useEffect } from 'react'

/**
 * Custom hook to detect if the current viewport is mobile (≤680px)
 * @param {number} breakpoint - The breakpoint in pixels (default: 680)
 * @returns {boolean} - True if viewport width is ≤ breakpoint
 */
const useIsMobile = (breakpoint = 680) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint)
    }

    // Check on mount
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [breakpoint])

  return isMobile
}

export default useIsMobile

