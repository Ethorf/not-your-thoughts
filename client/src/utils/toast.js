import { toast } from 'react-toastify'

import '../styles/toast.scss'

export const showToast = (message, type) => {
  const options = {
    theme: 'colored',
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: true,
  }
  const toastTypes = {
    success: toast.success(message, {...options }),
    warn: toast.warn(message, { ...options }),
    error: toast.error(message, { ...options })
  }
  return toastTypes[type] 
}
