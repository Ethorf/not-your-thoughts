import axiosInstance from '@utils/axiosInstance'

const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['x-auth-token'] = token
  } else {
    delete axiosInstance.defaults.headers.common['x-auth-token']
  }
}

export default setAuthToken
