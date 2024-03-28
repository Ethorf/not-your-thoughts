import { toast } from 'react-toastify'

import '../styles/toast.scss'

export const showToast = (message, type) => {

  const options = {
    theme: 'colored',
    position: 'bottom-right',
    autoClose: 2000,
    hideProgressBar: true,
  }

  return type
    ? type === 'success' 
      ? toast.success(message, {...options})
      : type === 'warn'
        ? toast.warn(message, {...options})
        : toast.error(message, {... options})
    : toast(message, options)
}
