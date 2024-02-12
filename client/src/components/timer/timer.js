import { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { setTimeElapsed } from '../../redux/actions/journalActions.js'

function Timer({ setTimeElapsed, timerActive }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let secondsInterval = null

    if (timerActive) {
      secondsInterval = setInterval(() => {
        setSeconds((seconds) => seconds + 1)
        setTimeElapsed(seconds)
      }, 1000)
    }
    return () => clearInterval(secondsInterval)
  }, [timerActive, seconds])

  return null
}

const mapStateToProps = (state) => ({
  timerActive: state.entries.timerActive,
})

export default connect(mapStateToProps, {
  setTimeElapsed,
})(Timer)
