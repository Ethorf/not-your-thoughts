import React, { useRef, useEffect, useState } from 'react'
import { TimelineMax } from 'gsap'
import '../../pages/Main/main.scss'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import progressSound25File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-25-progressSound.mp3'
import progressSound50File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-50-progressSound.mp3'
import progressSound75File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-75-progressSound.mp3'
import progressSound100File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-100-progressSound.mp3'

const progressSound25 = new Audio(progressSound25File)
const progressSound50 = new Audio(progressSound50File)
const progressSound75 = new Audio(progressSound75File)
const progressSound100 = new Audio(progressSound100File)

const ProgressWord = ({ wordCount, user, timeElapsed, guestMode }) => {
  let progressWordContainer = useRef(null)
  let progressNumberContainer = useRef(null)
  const [animationReady, setAnimationReady] = useState(true)
  const [progressNum, setProgressNum] = useState('25%')
  const [progressWordAnimation, setProgressAnimation] = useState(null)
  const tl = new TimelineMax({ paused: true })

  let userGoal
  let goalCount

  const progressAnimation = () => {
    setAnimationReady(false)
    setProgressAnimation(
      tl
        .to(progressNumberContainer, { duration: 1, opacity: 1 })
        .to(progressWordContainer, { duration: 1, opacity: 1 })
        .to(progressNumberContainer, { delay: 0.3, duration: 0.8, opacity: 0 })
        .to(progressWordContainer, { duration: 0.8, opacity: 0 })
        .play()
    )
    setTimeout(() => setAnimationReady(true), 4000)
  }

  useEffect(() => {
    if (guestMode) {
      userGoal = 200
      goalCount = wordCount
    } else if (user.goalPreference === 'words') {
      userGoal = user.dailyWordsGoal
      goalCount = wordCount
    } else if (user.goalPreference === 'time') {
      userGoal = user.dailyTimeGoal * 60
      goalCount = timeElapsed
    }

    if (animationReady && goalCount === userGoal / 4) {
      setProgressNum('25%')
      progressAnimation()
      if (user && user.progressAudioEnabled) {
        progressSound25.play()
      }
    } else if (animationReady && goalCount === userGoal / 2) {
      setProgressNum('50%')
      progressAnimation()
      if (user && user.progressAudioEnabled) {
        progressSound50.play()
      }
    } else if (animationReady && goalCount === userGoal * 0.75) {
      setProgressNum('75%')
      progressAnimation()
      if (user && user.progressAudioEnabled) {
        setProgressNum('100%')
        progressSound75.play()
      }
    } else if (animationReady && goalCount === userGoal) {
      setProgressNum('100%')
      progressAnimation()
      if (user && user.progressAudioEnabled) {
        progressSound100.play()
      }
    }
  }, [goalCount, userGoal, timeElapsed, wordCount])
  return (
    <div>
      <h2 ref={(h2) => (progressNumberContainer = h2)} className="main__progress-number">
        {progressNum}
      </h2>
      <h2 ref={(h2) => (progressWordContainer = h2)} className="main__progress-word">
        Complete
      </h2>
    </div>
  )
}

ProgressWord.propTypes = {
  wordCount: PropTypes.number,
}

const mapStateToProps = (state) => ({
  wordCount: state.wordCount.wordCount,
  goal: state.wordCount.goal,
  user: state.auth.user,
  timeElapsed: state.entries.timeElapsed,
  guestMode: state.auth.guestMode,
})

export default connect(mapStateToProps)(ProgressWord)
