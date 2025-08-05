import axios from 'axios'
import axiosRetry from 'axios-retry'

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8084/',
  timeout: 5000,
})

// Configure retry logic
axiosRetry(axiosInstance, {
  retries: 3, // Number of retries
  retryDelay: (retryCount) => {
    return retryCount * 1000 // Delay between retries (in milliseconds)
  },
  retryCondition: (error) => {
    // Retry only if network error or server error
    return (error.response && error.response.status >= 500) || error.code === 'ECONNABORTED'
  },
})

// Add request interceptor to include x-auth-token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage (or wherever you store it)
    const token = localStorage.getItem('x-auth-token')
    if (token) {
      // Add token to headers
      config.headers['x-auth-token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Function to attempt server restart
const attemptServerRestart = async () => {
  try {
    await axiosInstance.post('api/health/restart-server')
    console.log('Server restart initiated')
  } catch (error) {
    console.error('Failed to initiate server restart', error)
  }
}

// Add interceptor to check for server availability
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Server is down, attempting to restart...')
      await attemptServerRestart()
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
