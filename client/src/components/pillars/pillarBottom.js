import React from 'react'
import { connect, useSelector } from 'react-redux'
import '../../styles/shared.scss'
import pillarTopOutline from '../../assets/Pillars/NewPillarTop-Round-4.png'
import PillarTopOutlineInverted from '../../assets/Pillars/NewPillarTop-4-inverted.png'
import crawBoxBottom from '../../assets/Animations/SpikyCrawBox-Bottom-1.gif'
import crawBoxBottomInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Bottom.gif'

const PillarBottom = ({ auth: { user }, mode, timeElapsed, guestMode, journalConfig }) => {
  const { wordCount } = useSelector((state) => state.currentEntry)

  const pillarBottomStyleWidth = () => {
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
      width: `${-302 + calc}%`,
      left: `${99 - (-300 + calc)}%`,
    }
    const start = {
      width: `0%`,
      left: '99%',
    }
    const limit = {
      width: `96%`,
      left: '0%',
    }
    if (goalCount <= userGoal * 0.75) {
      return start
    } else if (goalCount >= userGoal * 0.75 && goalCount <= userGoal) {
      return testStyle
    } else {
      return limit
    }
  }
  return (
    <div className="main__pillar-bottom-container">
      {/* <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={finishLine} className= 
                {this.props.rubberDucky ? 'rubberDucky__finishLine' : 'rubberDucky__hidden'}></img>
                
                <img className={`main__pillar-bottom-outline 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={pillarTop} alt='pillar Shadow thing'></img>
                  <img ref={img=> this.pillarContainer = img} src={crawBoxBottom} className={`main__pillar-bottom ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarBottomStyleWidth()} alt="william"></img>                */}

      <img
        className="main__pillar-bottom-outline"
        src={mode === '-light' ? PillarTopOutlineInverted : pillarTopOutline}
        alt="pillar Shadow thing"
      ></img>
      <img
        className="main__pillar-bottom"
        src={mode === '-light' ? crawBoxBottomInverted : crawBoxBottom}
        style={pillarBottomStyleWidth()}
        alt="psychedelic pillar drawing 1"
      ></img>
    </div>
  )
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  guestMode: state.auth.guestMode,
  journalConfig: state.entries.journalConfig,
  mode: state.modes.mode,
  timeElapsed: state.entries.timeElapsed,
})

export default connect(mapStateToProps, null)(PillarBottom)
