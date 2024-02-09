import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import '../../pages/Main/Main.scss'
import pillarTopOutline from '../../assets/Pillars/NewPillarTop-Round-4.png'
import PillarTopOutlineInverted from '../../assets/Pillars/NewPillarTop-4-inverted.png'

import crawBoxTop from '../../assets/Animations/SpikyCrawBox-Top-1.gif'
import crawBoxTopInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Top.gif'

const PillarTop = ({ wordCount, goal, mode, auth: { user }, timeElapsed, guestMode }) => {
  const pillarTopStyleWidth = () => {
    let userGoal
    let goalCount
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
      {/* <img src={WaterfallUp} className= 
            {props.rubberDucky ? 'rubberDucky__waterFall-top' : 'rubberDucky__hidden'} alt=""></img>
            <img src={WaterfallUp} className= 
            {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
              <img src={WaterfallUp} className= 
            {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
              <img src={WaterfallUp} className= 
            {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
                <img src={WaterfallUp} className= {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'} alt=""></img>
                <img src={WaterfallUp} className= {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'} alt=""></img>
          <img className={`main__pillar-top-outline 
            ${props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`}
             src={pillarTop} alt='pillar Shadow thing'></img>
          <img ref={img=> pillarContainer = img}
           src={crawBoxTop} 
           className={`main__pillar-top ${props.rubberDucky ? 'rubberDucky__hidden' : ''}`}
           style={pillarTopStyleWidth()} alt=""></img>   */}

      <img
        className="main__pillar-top-outline"
        src={mode === '-light' ? PillarTopOutlineInverted : pillarTopOutline}
        alt="pillar Shadow thing"
      ></img>
      <img
        className="main__pillar-top"
        src={mode === '-light' ? crawBoxTopInverted : crawBoxTop}
        style={pillarTopStyleWidth()}
      ></img>
    </div>
  )
}

const mapStateToProps = (state) => ({
  wordCount: state.wordCount.wordCount,
  auth: state.auth,
  mode: state.modes.mode,
  guestMode: state.auth.guestMode,
  timeElapsed: state.entries.timeElapsed,
})

export default connect(mapStateToProps, null)(PillarTop)
