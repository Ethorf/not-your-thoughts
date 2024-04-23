import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNodeEntriesInfo } from '../redux/reducers/currentEntryReducer'
import isEqual from 'lodash/isEqual' // Import lodash isEqual for deep comparison

// TODO This is weird, not really doing the equivalency check it should
const useNodeEntriesInfo = () => {
  const dispatch = useDispatch()
  const { nodeEntriesInfo } = useSelector((state) => state.currentEntry)

  // useRef to store the previous nodeEntriesInfo
  const prevNodeEntriesInfo = useRef(nodeEntriesInfo)

  // Effect to dispatch API call only if nodeEntriesInfo has changed or is empty
  useEffect(() => {
    // Check if nodeEntriesInfo has changed using deep comparison
    const isNodeEntriesInfoEmpty = !nodeEntriesInfo || nodeEntriesInfo.length === 0
    const nodeEntriesInfoChanged = !isEqual(nodeEntriesInfo, prevNodeEntriesInfo.current)

    if (isNodeEntriesInfoEmpty || nodeEntriesInfoChanged) {
      dispatch(fetchNodeEntriesInfo())
      console.log('fetching node entries')
    }

    // Update prevNodeEntriesInfo to the current value
    prevNodeEntriesInfo.current = nodeEntriesInfo
  }, [dispatch, nodeEntriesInfo])

  return nodeEntriesInfo
}

export default useNodeEntriesInfo
