import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '@redux/reducers/categoriesReducer.js'

const useCategories = () => {
  const dispatch = useDispatch()
  const { allCategories } = useSelector((state) => state.categories)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (allCategories.length === 0) {
          console.log('fetching categires')
          await dispatch(fetchCategories())
        }
      } catch (error) {
        setError(error.message || 'An error occurred while fetching categories')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch, allCategories])

  return { allCategories, loading, error }
}

export default useCategories
