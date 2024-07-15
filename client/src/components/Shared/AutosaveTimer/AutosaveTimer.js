import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const AutosaveTimer = ({ handleAutosave }) => {
  const { wordCount } = useSelector((state) => state.currentEntry)

  const [shouldAutosave, setShouldAutosave] = useState(false)
  const [lastWordCount, setLastWordCount] = useState(wordCount)

  useEffect(() => {
    checkWordCount()
  }, [wordCount])

  const checkWordCount = () => {
    console.log('checking word count')
    // Check if the absolute difference between the current word count and the last word count is greater than 5
    if (Math.abs(wordCount - lastWordCount) > 5) {
      console.log('word count has changed by 5 or more, will autosave')
      setShouldAutosave(true)
      setLastWordCount(wordCount)
    }
  }

  useEffect(() => {
    let timer
    if (shouldAutosave) {
      timer = setInterval(() => {
        handleAutosave()
        setShouldAutosave(false)
      }, 5000) // Autosave every 30 seconds
    }

    // Clean up timer on component unmount or state change
    return () => clearInterval(timer)
  }, [shouldAutosave]) // Run when shouldAutosave changes

  return null // This component doesn't render anything visible
}

export default AutosaveTimer
