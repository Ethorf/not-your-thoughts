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
<<<<<<< HEAD
    success: toast.success(message, {...options }),
=======
    success: toast.success(message, {...options}),
>>>>>>> 203d0b8 (I think I got all of your feedback from the PR in here correctly, let me know if I missed somethin)
    warn: toast.warn(message, { ...options }),
    error: toast.error(message, { ...options })
  }
  return toastTypes[type] 
}
