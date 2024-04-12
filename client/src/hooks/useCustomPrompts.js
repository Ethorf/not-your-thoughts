import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomPrompts } from '../redux/reducers/customPromptsReducer'

const useCustomPrompts = () => {
  const dispatch = useDispatch()
  const customPrompts = useSelector((state) => state.customPrompts)

  useEffect(() => {
    // Fetch custom prompts using dispatch when the component mounts or when dependencies change
    dispatch(fetchCustomPrompts())
  }, [dispatch]) // Include dispatch as a dependency to prevent unnecessary re-fetching

  return customPrompts
}

export default useCustomPrompts
