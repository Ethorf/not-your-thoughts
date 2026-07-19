import { useState, useEffect } from 'react'

export const DEFAULT_MOBILE_BREAKPOINT = 680

/**
 * Non-hook check for mobile viewport width.
 * Safe to call outside React (returns false when `window` is unavailable).
 * @param {number} [breakpoint=680]
 * @returns {boolean}
 */
export const getIsMobileViewport = (breakpoint = DEFAULT_MOBILE_BREAKPOINT) => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.innerWidth <= breakpoint
}

/**
 * React hook for mobile viewport (≤680px by default).
 * Updates on resize. Initial value matches the current viewport on the client.
 *
 * @example
 * const isMobile = useIsMobile()
 * return !isMobile && <DesktopOnly />
 *
 * @param {number} [breakpoint=680]
 * @returns {boolean}
 */
const useIsMobile = (breakpoint = DEFAULT_MOBILE_BREAKPOINT) => {
  const [isMobile, setIsMobile] = useState(() => getIsMobileViewport(breakpoint))

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(getIsMobileViewport(breakpoint))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [breakpoint])

  return isMobile
}

export default useIsMobile
