import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNodeEntriesInfo } from '../redux/reducers/currentEntryReducer'

let isFetchingGlobally = false

const useNodeEntriesInfo = (enabled = true) => {
  const dispatch = useDispatch()
  const { nodeEntriesInfo, entriesLoading } = useSelector((state) => state.currentEntry)
  const { isAuthenticated, token } = useSelector((state) => state.auth)

  const fetchAttemptedRef = useRef(false)
  const prevEnabledRef = useRef(enabled)

  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      fetchAttemptedRef.current = false
    }
    prevEnabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const hasAuth = isAuthenticated || token || localStorage.getItem('token')
    if (!hasAuth) {
      return
    }

    const isNodeEntriesInfoEmpty = !nodeEntriesInfo || nodeEntriesInfo.length === 0

    if (isNodeEntriesInfoEmpty && !entriesLoading && !isFetchingGlobally && !fetchAttemptedRef.current) {
      isFetchingGlobally = true
      fetchAttemptedRef.current = true

      dispatch(fetchNodeEntriesInfo()).finally(() => {
        isFetchingGlobally = false
      })
    }

    if (nodeEntriesInfo && nodeEntriesInfo.length > 0) {
      fetchAttemptedRef.current = false
      isFetchingGlobally = false
    }
  }, [dispatch, nodeEntriesInfo, entriesLoading, enabled, isAuthenticated, token])

  return nodeEntriesInfo
}

export default useNodeEntriesInfo
