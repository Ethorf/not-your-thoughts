
import React,  { useRef, useEffect, useState } from "react";
import { TweenMax, TimelineMax} from "gsap";
import '../../pages/main/main.scss'
import PropTypes from 'prop-types'
import { connect } from "react-redux";
import wordCountReducer from "../../redux/reducers/wordCountReducer";
import progressSound25File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-25-progressSound.mp3'
import progressSound50File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-50-progressSound.mp3'
import progressSound75File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-75-progressSound.mp3'
import progressSound100File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-100-progressSound.mp3'

const progressSound25 = new Audio(progressSound25File)
const progressSound50 = new Audio(progressSound50File)
const progressSound75 = new Audio(progressSound75File)
const progressSound100 = new Audio(progressSound100File)

const ProgressWord = (wordCount) => {

    let progressWordContainer = useRef(null);
    let progressNumberContainer = useRef(null);

    const [progressWordAnimation, setProgressAnimation] = useState(null);
    const tl = new TimelineMax({paused:true})

    const progressAnimation = () =>{
        setProgressAnimation(
            tl.to(progressNumberContainer, {duration:1.5,opacity:1 })
            .to(progressWordContainer, {duration:1.5,opacity:1 }).play()
         );
    }
    
    const progressAnimationReverse = () =>{
        setProgressAnimation(
            tl.to(progressNumberContainer, {duration:1.5,opacity:0 })
               .to(progressWordContainer, {duration:1.5,opacity:0 }).play()

         );
    }

    const percentCalc = (wordCount) => {
        if (wordCount >=100 && wordCount <= 110){
          return "25%"
        } else if (wordCount >=200 && wordCount <= 210){
          return "50%"
        }
        else if (wordCount >=300 && wordCount <= 310){
          return "75%"
        } else if (wordCount >=400 && wordCount <= 410){
          return "100%"
        }
      }

   useEffect(()=>{
  
    if (wordCount.wordCount === 100){
        progressAnimation()
        progressSound25.play()
    } 
    else if (wordCount.wordCount === 105){
    progressAnimationReverse()
    }
    else if ( wordCount.wordCount === 200){
    progressAnimation()
    progressSound50.play()

    }
    else if (wordCount.wordCount === 208){
    progressAnimationReverse()
    }
    else if ( wordCount.wordCount === 300){
    progressAnimation()
    progressSound75.play()

    }
    else if (wordCount.wordCount === 305){
      progressAnimationReverse()
    }
    else if ( wordCount.wordCount === 400){
      progressAnimation()
      progressSound100.play()

   } 

   },[wordCount.wordCount])

    return (
        <div>
            <h2 ref={h2=> progressWordContainer = h2} className="main__progress-word">Complete</h2>
            <h2 ref={h2=> progressNumberContainer = h2} className="main__progress-number">{percentCalc(wordCount.wordCount)}</h2>
        </div>
    )
}

ProgressWord.propTypes = {
    wordCount: PropTypes.number,
}

const mapStateToProps = state => ({
    wordCount: state.wordCount.wordCount
  });

  export default connect(mapStateToProps)(ProgressWord);

