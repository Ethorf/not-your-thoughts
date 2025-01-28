import React from 'react'
import { connect, useSelector } from 'react-redux'
import '../../styles/shared.scss'
import pillarTopOutline from '../../assets/Pillars/NewPillarTop-Round-4.png'
import PillarTopOutlineInverted from '../../assets/Pillars/NewPillarTop-4-inverted.png'

import crawBoxTop from '../../assets/Animations/SpikyCrawBox-Top-1.gif'
import crawBoxTopInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Top.gif'

const PillarTop = ({ mode, auth: { user }, guestMode }) => {
  const { wordCount } = useSelector((state) => state.currentEntry)
  const { journalConfig, timeElapsed } = useSelector((state) => state.journalEntries)

  const getPillarTopStyleWidth = () => {
    let userGoal
    let goalCount

    if (guestMode) {
      userGoal = 200
      goalCount = wordCount
    } else if (journalConfig.journal_goal_preference === 'words') {
      userGoal = journalConfig.daily_words_goal
      goalCount = wordCount
    } else if (journalConfig.journal_goal_preference === 'time') {
      userGoal = user.dailyTimeGoal * 60
      goalCount = timeElapsed
    }
    let calc = goalCount / ((userGoal / 4) * 0.01)
    const testStyle = {
      width: `${-103 + calc - 2}%`,
    }
    const start = { width: `0%` }
    const limit = { width: `97%` }
    if (goalCount <= userGoal / 4) {
      return start
    } else if (goalCount >= userGoal / 4 && goalCount <= userGoal / 2) {
      return testStyle
    } else {
      return limit
    }
  }
  return (
    <div className="main__pillar-top-container">
      <img
        className="main__pillar-top-outline"
        src={mode === '-light' ? PillarTopOutlineInverted : pillarTopOutline}
        alt="pillar Shadow thing"
      />
      <img
        className="main__pillar-top"
        src={mode === '-light' ? crawBoxTopInverted : crawBoxTop}
        alt="top progress pillar"
        style={getPillarTopStyleWidth()}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  mode: state.modes.mode,
  guestMode: state.auth.guestMode,
})

export default connect(mapStateToProps, null)(PillarTop)
