import { toast } from 'react-toastify'

import '../styles/toast.scss'

/**
 * Normalizes message to a display string. Handles error objects that would otherwise show as [object Object].
 */
const toDisplayMessage = (message) => {
  if (typeof message === 'string') return message
  if (message && typeof message === 'object') {
    return message.message || message.msg || message.error || JSON.stringify(message)
  }
  return 'An error occurred'
}

export const showToast = (message, type) => {
  const displayMessage = toDisplayMessage(message)
  const options = {
    theme: 'colored',
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: true,
  }

  const toastTypes = {
    success: toast.success(displayMessage, { ...options }),
    warn: toast.warn(displayMessage, { ...options }),
    error: toast.error(displayMessage, { ...options }),
  }
  // NOTE Not entirely sure why but showToast needs to return a function like this in order to function correctly
  return () => toastTypes[type]
}
