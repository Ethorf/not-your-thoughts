/**
 * Utility functions for managing browser cookies
 */

/**
 * Gets the value of a cookie by name
 * @param {string} name - The name of the cookie
 * @returns {string|null} The cookie value or null if not found
 */
export const getCookieValue = (name) => {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.split('=')[1])
}

/**
 * Sets a cookie with a specified name, value, and expiration days
 * @param {string} name - The name of the cookie
 * @param {string} value - The value to set
 * @param {number} expiryDays - Number of days until the cookie expires (default: 365)
 */
export const setCookie = (name, value, expiryDays = 365) => {
  if (typeof document === 'undefined') {
    return
  }

  const expiryDate = new Date()
  expiryDate.setTime(expiryDate.getTime() + expiryDays * 24 * 60 * 60 * 1000)

  document.cookie = `${name}=${value};expires=${expiryDate.toUTCString()};path=/`
}

/**
 * Removes a cookie by setting its expiration date to the past
 * @param {string} name - The name of the cookie to remove
 */
export const removeCookie = (name) => {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

