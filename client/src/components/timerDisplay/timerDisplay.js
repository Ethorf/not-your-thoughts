import React from 'react'
import { connect } from 'react-redux'
import '../../pages/Main/Main.scss'
import './timerDisplay.scss'
import { toggleTimerActive } from '../../redux/actions/journalConfigActions.js'
import pause from '../../assets/Icons/Icon-pause.png'
import play from '../../assets/Icons/Icon-play.png'

function TimerDisplay({ toggleTimerActive, timeElapsed, timerActive }) {
  return (
    <div className="timer">
      <span className={'timer__left'}>{Math.trunc(timeElapsed / 60)}m:</span>
      <span className={'timer__middle'}>{timeElapsed % 60}s</span>
      <span className={'timer__right'}>
        <img
          className="timer__play-pause"
          onClick={() => toggleTimerActive(!timerActive)}
          src={timerActive ? pause : play}
        />
      </span>
    </div>
  )
}

const mapStateToProps = (state) => ({
  timeElapsed: state.entries.timeElapsed,
  timerActive: state.entries.timerActive,
})

export default connect(mapStateToProps, {
  toggleTimerActive,
})(TimerDisplay)
