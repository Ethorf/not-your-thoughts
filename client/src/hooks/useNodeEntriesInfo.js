import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNodeEntriesInfo } from '../redux/reducers/currentEntryReducer'

const useNodeEntriesInfo = () => {
  const dispatch = useDispatch()
  const { nodeEntriesInfo } = useSelector((state) => state.currentEntry)

  useEffect(() => {
    dispatch(fetchNodeEntriesInfo())
  }, [dispatch])

  return nodeEntriesInfo
}

export default useNodeEntriesInfo
