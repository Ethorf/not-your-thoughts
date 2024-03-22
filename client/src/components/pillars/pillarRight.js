import React from 'react'
import { connect, useSelector } from 'react-redux'
import '../../styles/shared.scss'
import PillarRightOutline from '../../assets/Pillars/NewPillarLeft-2.png'
import PillarLeftOutlineInverted from '../../assets/Pillars/NewPillarLeft-2-inverted.png'

import crawBoxRight from '../../assets/Animations/SpikyCrawBox-Right-1.gif'
import crawBoxRightInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Right.gif'

const PillarRight = ({ auth: { user }, mode, timeElapsed, guestMode, journalConfig }) => {
  const { wordCount } = useSelector((state) => state.currentEntry)

  const getPillarRightStyleHeight = () => {
    let userGoal
    let goalCount

    if (guestMode) {
      userGoal = 200
      goalCount = wordCount
    } else if (journalConfig.goal_preference === 'words') {
      userGoal = journalConfig.daily_words_goal
      goalCount = wordCount
    } else if (journalConfig.goal_preference === 'time') {
      userGoal = user.dailyTimeGoal * 60
      goalCount = timeElapsed
    }
    let calc = goalCount / ((userGoal / 4) * 0.01)
    const testStyle = {
      height: `${-201 + calc + 1}%`,
    }
    const start = { height: `0%` }
    const limit = { height: `100%` }
    if (goalCount <= userGoal / 2) {
      return start
    } else if (goalCount >= userGoal / 2 && goalCount <= userGoal * 0.75) {
      return testStyle
    } else {
      return limit
    }
  }
  return (
    <div className="main__pillar-right-container">
      <img
        className="main__pillar-right-outline"
        src={mode === '-light' ? PillarLeftOutlineInverted : PillarRightOutline}
        alt="pillar Shadow thing"
      />
      <img
        alt="right progress pillar"
        className="main__pillar-right"
        src={mode === '-light' ? crawBoxRightInverted : crawBoxRight}
        style={getPillarRightStyleHeight()}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  guestMode: state.auth.guestMode,
  mode: state.modes.mode,
  timeElapsed: state.entries.timeElapsed,
  journalConfig: state.entries.journalConfig,
})

export default connect(mapStateToProps)(PillarRight)
