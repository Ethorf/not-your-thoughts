import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const AutosaveTimer = ({ handleAutosave }) => {
  const { wordCount } = useSelector((state) => state.currentEntry)

  const [shouldAutosave, setShouldAutosave] = useState(false)

  // Check word count on load
  useEffect(() => {
    // Perform initialization check here
    checkWordCount()
  }, []) // Only run once on component mount

  // Watch for changes in word count
  useEffect(() => {
    if (wordCount >= 5) {
      setShouldAutosave(true)
    }
  }, [wordCount])

  // Function to check word count on load
  const checkWordCount = () => {
    // Perform initial checks and actions here
    if (wordCount >= 5) {
      setShouldAutosave(true)
    }
  }

  // Set up autosave timer
  useEffect(() => {
    let timer
    if (shouldAutosave) {
      timer = setInterval(() => {
        handleAutosave()
      }, 30000) // Autosave every 30 seconds
    }

    // Clean up timer on component unmount or state change
    return () => clearInterval(timer)
  }, [shouldAutosave]) // Run when shouldAutosave changes

  return null // This component doesn't render anything visible
}

export default AutosaveTimer
