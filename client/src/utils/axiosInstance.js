import axios from 'axios'
import axiosRetry from 'axios-retry'

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8082/api', // Base URL for the API
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
    return error.response.status >= 500 || error.code === 'ECONNABORTED'
  },
})

export default axiosInstance
