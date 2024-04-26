import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomPrompts } from '../redux/reducers/customPromptsReducer'

const useCustomPrompts = () => {
  const dispatch = useDispatch()
  const customPrompts = useSelector((state) => state.customPrompts)
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    // Fetch custom prompts using dispatch when the component mounts or when user changes
    dispatch(fetchCustomPrompts())
  }, [dispatch, user]) // Include dispatch and user as dependencies

  return customPrompts
}

export default useCustomPrompts
