import axios from 'axios'
import axiosRetry from 'axios-retry'

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8082/', // Base URL for the API
  timeout: 5000, // Request timeout in milliseconds
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
