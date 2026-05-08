import axios from 'axios'
import axiosRetry from 'axios-retry'

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: '/',
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
    // Token is stored as 'token' in localStorage (see authReducer.js)
    const token = localStorage.getItem('token')
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

// Function to attempt server restart (development only)
const attemptServerRestart = async () => {
  // Only attempt restart in development
  if (process.env.NODE_ENV !== 'development') {
    return
  }
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

const inflightGetRequests = new Map()
const recentGetResponses = new Map()
const GET_RESPONSE_TTL_MS = 2000

const buildGetRequestKey = (config = {}) => {
  const method = (config.method || 'get').toLowerCase()
  const url = config.url || ''
  const params = config.params || {}
  const sortedParamPairs = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|')

  return `${method}:${url}?${sortedParamPairs}`
}

const baseRequest = axiosInstance.request.bind(axiosInstance)

axiosInstance.request = (config = {}) => {
  const method = (config.method || 'get').toLowerCase()
  if (method !== 'get') {
    return baseRequest(config)
  }

  const key = buildGetRequestKey(config)
  const now = Date.now()
  const cached = recentGetResponses.get(key)

  if (cached && now - cached.timestamp < GET_RESPONSE_TTL_MS) {
    return Promise.resolve(cached.response)
  }

  if (inflightGetRequests.has(key)) {
    return inflightGetRequests.get(key)
  }

  const requestPromise = baseRequest(config)
    .then((response) => {
      recentGetResponses.set(key, { response, timestamp: Date.now() })
      return response
    })
    .finally(() => {
      inflightGetRequests.delete(key)
    })

  inflightGetRequests.set(key, requestPromise)
  return requestPromise
}

export default axiosInstance
