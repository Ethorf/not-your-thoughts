import { toast } from 'react-toastify'

import '../styles/toast.scss'

export const showToast = (message, type) => {
  const options = {
    theme: 'colored',
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: true,
  }
  return () => {
    type === 'success' && toast.success(message, { ...options })
    type === 'warn' && toast.warn(message, { ...options })
    type === 'error' && toast.error(message, { ...options })
  }
}
