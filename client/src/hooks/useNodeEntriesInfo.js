import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNodeEntriesInfo } from '../redux/reducers/currentEntryReducer'

// Module-level flag to prevent multiple simultaneous fetches across all hook instances
let isFetchingGlobally = false

const useNodeEntriesInfo = () => {
  const dispatch = useDispatch()
  const { nodeEntriesInfo, entriesLoading } = useSelector((state) => state.currentEntry)

  // useRef to track if we've attempted to fetch in this hook instance
  const fetchAttemptedRef = useRef(false)

  // Effect to dispatch API call only if nodeEntriesInfo is empty and not already loading
  useEffect(() => {
    const isNodeEntriesInfoEmpty = !nodeEntriesInfo || nodeEntriesInfo.length === 0
    
    // Only fetch if:
    // 1. We don't have nodeEntriesInfo data, AND
    // 2. We're not currently loading (check Redux state), AND
    // 3. No global fetch is in progress (prevent race conditions), AND
    // 4. We haven't already attempted to fetch in this component instance
    if (isNodeEntriesInfoEmpty && !entriesLoading && !isFetchingGlobally && !fetchAttemptedRef.current) {
      // Set global flag synchronously BEFORE dispatch to prevent race conditions
      isFetchingGlobally = true
      fetchAttemptedRef.current = true
      
      dispatch(fetchNodeEntriesInfo())
        .then(() => {
          isFetchingGlobally = false
        })
        .catch((err) => {
          isFetchingGlobally = false
          // On error, reset so we can retry
          fetchAttemptedRef.current = false
          console.error('Error fetching node entries:', err)
        })
      
      console.log('fetching node entries')
    }

    // Reset the flag if we now have data (allowing future fetches if data becomes empty again)
    if (nodeEntriesInfo && nodeEntriesInfo.length > 0) {
      fetchAttemptedRef.current = false
      isFetchingGlobally = false
    }
  }, [dispatch, nodeEntriesInfo, entriesLoading])

  return nodeEntriesInfo
}

export default useNodeEntriesInfo
