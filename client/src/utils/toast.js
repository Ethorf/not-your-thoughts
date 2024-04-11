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
    success: toast.success(message, { ...options }),
    warn: toast.warn(message, { ...options }),
    error: toast.error(message, { ...options }),
  }
  // NOTE Not entirely sure why but showToast needs to return a function like this in order to function correctly
  return () => toastTypes[type]
}
