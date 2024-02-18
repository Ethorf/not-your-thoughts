import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import '../../pages/Main/Main.scss'
import PillarRightOutline from '../../assets/Pillars/NewPillarLeft-2.png'
import PillarLeftOutlineInverted from '../../assets/Pillars/NewPillarLeft-2-inverted.png'

import crawBoxRight from '../../assets/Animations/SpikyCrawBox-Right-1.gif'
import crawBoxRightInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Right.gif'

const PillarRight = ({ wordCount, auth: { user }, mode, timeElapsed, guestMode, journalConfig }) => {
  const pillarRightStyleHeight = () => {
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
      {/* <div className={`main__pillar-right-container 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-right-container' : ''}`}>
                  <img alt="" src={WaterfallUp} className= {this.props.rubberDucky ? 'rubberDucky__waterFall-right' :
                  'rubberDucky__hidden'}></img>
                    <img className={`main__pillar-right-outline 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={nuPillarLeft} alt='pillar Shadow thing'></img>
                  < img ref={img=> this.pillarContainer = img} src={crawBoxRight} className={`main__pillar-right ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarRightStyleHeight()} alt="right pillar"></img>                

                </div>
              </div> */}

      <img
        className="main__pillar-right-outline"
        src={mode === '-light' ? PillarLeftOutlineInverted : PillarRightOutline}
        alt="pillar Shadow thing"
      ></img>
      <img
        className="main__pillar-right"
        src={mode === '-light' ? crawBoxRightInverted : crawBoxRight}
        style={pillarRightStyleHeight()}
      ></img>
    </div>
  )
}

const mapStateToProps = (state) => ({
  wordCount: state.wordCount.wordCount,
  auth: state.auth,
  guestMode: state.auth.guestMode,
  mode: state.modes.mode,
  timeElapsed: state.entries.timeElapsed,
  journalConfig: state.entries.journalConfig,
})

export default connect(mapStateToProps)(PillarRight)
