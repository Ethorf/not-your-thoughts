import React from 'react'
import { connect, useSelector } from 'react-redux'
import '../../styles/shared.scss'
import PillarLeftOutline from '../../assets/Pillars/NewPillarLeft-2.png'
import PillarLeftOutlineInverted from '../../assets/Pillars/NewPillarLeft-2-inverted.png'

import crawBoxLeft from '../../assets/Animations/SpikyCrawBox-Left-1.gif'
import crawBoxLeftInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Left.gif'

const PillarLeft = ({ mode, auth: { user }, guestMode }) => {
  const { wordCount } = useSelector((state) => state.currentEntry)
  const { journalConfig, timeElapsed } = useSelector((state) => state.journalEntries)

  const pillarLeftStyleHeight = () => {
    let testStyle
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

    const limit = {
      height: `100%`,
    }
    testStyle = {
      height: `${calc + 1}%`,
      opacity: `${goalCount / (userGoal / 10)}`,
    }
    if (goalCount <= userGoal / 4) {
      return testStyle
    } else {
      return limit
    }
  }

  return (
    <div className="main__pillar-left-container">
      <img
        className="main__pillar-left-outline"
        src={mode === '-light' ? PillarLeftOutlineInverted : PillarLeftOutline}
        alt="pillar Shadow thing"
      />
      <img
        className="main__pillar-left"
        src={mode === '-light' ? crawBoxLeftInverted : crawBoxLeft}
        style={pillarLeftStyleHeight()}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  guestMode: state.auth.guestMode,
  mode: state.modes.mode,
})

export default connect(mapStateToProps, null)(PillarLeft)
