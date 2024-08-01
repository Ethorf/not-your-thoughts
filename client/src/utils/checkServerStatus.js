import axios from 'axios'

export const checkServerStatus = async (url, interval = 5000) => {
  const checkStatus = async () => {
    try {
      await axios.get(url)
      console.log('Server is up')
    } catch (error) {
      console.error('Server is down, retrying...')
      setTimeout(checkStatus, interval)
    }
  }

  checkStatus()
}
