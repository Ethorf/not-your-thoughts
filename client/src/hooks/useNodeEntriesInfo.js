import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNodeEntriesInfo } from '../redux/reducers/currentEntryReducer'

const useNodeEntriesInfo = () => {
  const dispatch = useDispatch()
  const { nodeEntriesInfo } = useSelector((state) => state.currentEntry)

  // useRef to store the previous nodeEntriesInfo
  const prevNodeEntriesInfo = useRef(nodeEntriesInfo)

  // Effect to dispatch API call only if nodeEntriesInfo has changed
  useEffect(() => {
    // Check if nodeEntriesInfo has changed
    if (nodeEntriesInfo !== prevNodeEntriesInfo.current) {
      dispatch(fetchNodeEntriesInfo())
      // Update prevNodeEntriesInfo to the current value
      prevNodeEntriesInfo.current = nodeEntriesInfo
    }
  }, [dispatch, nodeEntriesInfo])

  return nodeEntriesInfo
}

export default useNodeEntriesInfo
