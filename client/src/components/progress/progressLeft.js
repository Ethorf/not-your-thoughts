import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import progressSound25File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-25-progressSound.mp3'
import progressSound50File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-50-progressSound.mp3'
import progressSound75File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-75-progressSound.mp3'
import progressSound100File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-100-progressSound.mp3'

progressSound25 = new Audio(progressSound25File)
progressSound50 = new Audio(progressSound50File)
progressSound75 = new Audio(progressSound75File)
progressSound100 = new Audio(progressSound100File)



function progressLeft(props) {

    if (wordCount === 100){
        progressSound25.volume = 0.3
        progressSound25.play()
        progressAnimation()
    } 
  else if (wordCount === 105){
    progressAnimationReverse()
  }
  else if ( wordCount === 200){
    progressSound50.volume = 0.3
    progressSound50.play()
    progressAnimation()
  }
  else if (wordCount === 208){
    progressAnimationReverse()
  }
  else if ( wordCount === 300){
    progressSound75.volume = 0.3
    progressSound75.play()
    progressAnimation()
}
else if (wordCount === 305){
  progressAnimationReverse()
}
else if ( wordCount === 400){
  progressSound100.volume = 0.5
  progressSound100.play()
  progressAnimation()
}
    


    return (
        <div>
            <h2 ref={h2=> progressNumberContainer = h2} className="main__progress-number">{percentCalc(wordCount)}</h2>
        </div>
    )
}

progressLeft.propTypes = {

}




export default progressLeft

