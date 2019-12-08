import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './main.scss';
import '../../styles/mixins.scss'
import '../../styles/rubberDucky.scss'

import Prompt from '../../components/prompt/prompt'
import posed from 'react-pose';
import moment from 'moment'
import NavBarSide from '../../components/nav/navBarSide.js'
import { TweenMax } from "gsap/all";
import { Transition } from "react-transition-group";
import SuccessModal from '../../components/successModal/successModal';
import '../../components/successModal/successModal.scss';
import pillarTest from '../../assets/pillarTest.png'
import pillarTop from   '../../assets/pillarTop.png'
import CrawlingBoxT1 from '../../assets/CrawlingBoxT-1.png'
import bgOverlayTextureWhite from '../../assets/Background-Images/bgImg-donut1.png'
import waveAnimation from '../../assets/waveAnimationFull.gif'
import AudioPlayer from '../../components/audioPlayer/audioPlayer.js'
import keySFXFile from '../../assets/Sounds/Not-Your-Thoughts-Keyboard-SFX-1.mp3'
import progressSound25File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-25-progressSound.mp3'
import progressSound50File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-50-progressSound.mp3'
import progressSound75File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-75-progressSound.mp3'
import progressSound100File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-100-progressSound.mp3'
import WaterfallUp from '../../assets/RubberDucky/waterFall.gif'
import duckIcon from '../../assets/RubberDucky/duckIcon-nolegs.gif'
import nuPillarLeft from '../../assets/nuPillarLeft-1.png'


import { TimelineLite, CSSPlugin } from "gsap/all";



//animation vars
const progressNumberContainer = null;
const progressNumberTween = null;
const progressWordContainer = null;
const progressWordTween = null;
const modalContentContainer = null;
const modalContentTween = null;
const modalOverlayContainer = null;
const modalOverlayTween = null;
const textAreaContainer = null;
const bgImgContainer = null;
const bgImgTween = null;
// audio files
const keySFX1 = new Audio(keySFXFile)


const Header = posed.div({
  hidden: { opacity: 0.4 },
  visible: { opacity: 1 }
});


export default class Main extends React.Component {

  startState = { autoAlpha: 0, y: -1000 };

  //Audio Progress Variables
  progressSound25 = new Audio(progressSound25File)
  progressSound50 = new Audio(progressSound50File)
  progressSound75 = new Audio(progressSound75File)
  progressSound100 = new Audio(progressSound100File)


  randomNum = (max) =>{
    return Math.floor(Math.random() * max)
  }

  state = {
    wordCount:0,
    charCount:0,
    limitReached:false, 
    date:moment().format("MM/DD/YYYY"),
    bgIsVisible: true, 
    isVisible: true, 
    pillar1WordLimit:100,
    pillar2WordLimit:200,
    pillar3WordLimit:300,
    pillar4WordLimit:400,
    goal:400,
    modalIsOpen: false,
    goalReached:false,
    
   
  } 
  //Progress Animation Calculations 
  percentCalc = (wordCount) => {
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

  //Pillar animation functions
    pillarLeftStyleHeight = () =>{
      const testStyle = {
        height:`${(this.state.wordCount +1)}%`,
        opacity:`${this.state.wordCount/10}`
      };
      const limit = {
        height:`100%`
      }
      if (this.state.wordCount <= this.state.pillar1WordLimit){
        return testStyle
      } else {
        return limit
      }
    }
    pillarTopStyleWidth = () =>{
      const testStyle = {
        width:`${(-100 + this.state.wordCount)+1}%`
      };
      const start = {
        width:`0%`
      }
      const limit = {
        width:`100%`
      }
      if (this.state.wordCount <= this.state.pillar1WordLimit){
        return start
      } else if (this.state.wordCount >= this.state.pillar1WordLimit && this.state.wordCount <= this.state.pillar2WordLimit  ) {
        return testStyle
      }
      else{
        return limit
      }
    }
    pillarRightStyleHeight = () =>{
      const testStyle = {
        height:`${(-200 + this.state.wordCount+1 )}%`
      };
      const start = {height:`0%`}
      const limit = {height:`100%`}
      if (this.state.wordCount <= this.state.pillar2WordLimit){
        return start
      } else if(this.state.wordCount >= this.state.pillar2WordLimit && this.state.wordCount <= this.state.pillar3WordLimit  ) {
        return testStyle
      }
      else{
        return limit
      }
    }
    pillarBottomStyleWidth = () =>{
      const testStyle = {
        width:`${(-300 + this.state.wordCount)+1}%`,
        left:`${99-((-300 + this.state.wordCount)+1)}%`
      };
      const start = {
        width:`1%`, left:"99%"
      }
      const limit = {
        width:`100%`
      }
      if (this.state.wordCount <= this.state.pillar3WordLimit){
        return start
      } else if(this.state.wordCount >= this.state.pillar3WordLimit && this.state.wordCount <= this.state.pillar4WordLimit  ) {
        return testStyle
      }
      else{
        return limit
      }
    }

    ////////  Rubber Ducky Functions / Animations 

    duckAnimationStyle = () =>{

      const upStyle = {
        bottom:`${100+(this.state.wordCount*5)+5}px`,
      };
      const rightStyle = {
        bottom:'595px',
        left:`${-785+(this.state.wordCount*10.5)}px`
      };
      const downStyle = {
        top:`${-780 +(this.state.wordCount*4.5)}px`,
        left:`1300px`,
      };
      const leftStyle = {
        top:`657px`,        
        left:`${4538-(this.state.wordCount*10.7)}px`,
      };
      const limit = {
        bottom:'180px'
      }
      if (this.state.wordCount <= this.state.pillar1WordLimit){
        return upStyle
      } else if (this.state.wordCount >= this.state.pillar1WordLimit && this.state.wordCount <= this.state.pillar2WordLimit)  {
        return rightStyle
      } else if (this.state.wordCount >= this.state.pillar2WordLimit && this.state.wordCount <= this.state.pillar3WordLimit)  {
        return downStyle
      }  else if (this.state.wordCount >= this.state.pillar3WordLimit && this.state.wordCount <= this.state.pillar4WordLimit)  {
        return leftStyle
      } else {
        return limit
      }
    }



    //Text input Variables and Function


    textNum = (e) => {
        e.preventDefault()
        this.setState({
          wordCount: e.target.value.split(' ').length -1,
          charCount: e.target.value.split('').length
        })
        if (this.state.wordCount > 400){
          e.target.value = e.target.value + " ";
        }
    }
    bgPulse = () => {
        this.bgImgTween.play()
          setTimeout(()=>{
            this.bgImgTween.reverse()
          },1800)
    }
    componentDidMount(){
      setInterval(() => {
        this.setState({ isVisible: !this.state.isVisible, 
        })
      }, 20);
      setInterval(()=>{
        this.bgPulse()
      },12000)

      this.progressNumberTween = new TimelineLite({ paused:true })
      .to(this.progressNumberContainer, {duration:1.5,opacity:1 })

      this.progressWordTween = new TimelineLite({ paused:true })
      .to(this.progressWordContainer, {duration:1.5,opacity:1 })

      this.modalContentTween = new TimelineLite({ paused:true })
      .to(this.modalContentContainer, {duration:1,y:100,opacity:1 })

      this.modalOverlayTween = new TimelineLite({ paused:true })
      .to(this.modalOverlayContainer, {duration:1,opacity:1 })

      this.bgImgTween = new TimelineLite({ paused:true })
      .to(this.bgImgContainer, {duration:3.3,opacity:0.45 })

    }
    modalAnimation = () =>{
      this.setState({
        modalIsOpen:true
      })
      this.modalContentTween.play()
      this.modalOverlayTween.play()
    }
    modalCloseAnimation = () =>{
      this.setState({
        modalIsOpen:false
      })
      this.modalContentTween.reverse()
      this.modalOverlayTween.reverse()
    }
    progressAnimation = () => {
        this.progressNumberTween.play()
        this.progressWordTween.play()
    }
    progressAnimationReverse = () => {
        this.progressNumberTween.reverse()
        this.progressWordTween.reverse()
    }

   

    componentDidUpdate(){

      if (this.state.wordCount === 100){
            this.progressSound25.volume = 0.3
            this.progressSound25.play()
            this.progressAnimation()
      } 
      
      else if (this.state.wordCount === 105){
        this.progressAnimationReverse()
      }
      
      else if ( this.state.wordCount === 200){
        this.progressSound50.volume = 0.3
        this.progressSound50.play()
        this.progressAnimation()
      }

      else if (this.state.wordCount === 208){
        this.progressAnimationReverse()
      }
      

      else if ( this.state.wordCount === 300){
        this.progressSound75.volume = 0.3
        this.progressSound75.play()
        this.progressAnimation()
    }
    
    else if (this.state.wordCount === 305){
      this.progressAnimationReverse()
    }
    else if ( this.state.wordCount === 400){
      this.progressSound100.volume = 0.5
      this.progressSound100.play()
      this.progressAnimation()

      setTimeout(()=>{
        this.setState({
          wordCount:401
        })
      },10)
      setTimeout(()=>{
        this.modalAnimation()
    
      },4000)

      setTimeout(()=>{this.props.increaseDays(this.props.currentUser.conDays,this.props.currentUser.totDays)},6000)

 
    }
  }
    render(){
      return (  
       
      <div className="main__all-container modalize">
      <NavBarSide rubberDucky={this.props.rubberDucky} />
        <img ref={img=> this.bgImgContainer = img}  className={`main__bg-img ${this.props.rubberDucky? 'rubberDucky__hidden' : ''}`} src={bgOverlayTextureWhite}></img>
        <div className={`main ${this.props.rubberDucky ? 'rubberDucky' : 'black'}`}>
          <Header rubberDucky={this.props.rubberDucky} pose={this.state.isVisible ? 'visible' : 'hidden'}
                   className={`main__header ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>
            Not Your Thoughts
          </Header >
          <Prompt rubberDucky={this.props.rubberDucky} />
          <h2 ref={h2=> this.progressNumberContainer = h2} className={`main__progress-number ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>{this.percentCalc(this.state.wordCount)}</h2>
          <h2 ref={h2=> this.progressWordContainer = h2} className={`main__progress-word ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>Complete</h2>
          {/* Pillar TOP container */}
          <div className="main__pillar-top-container">
          {/* Pillar TOP Rubber Ducky Images Start */}
            <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-top' : 'rubberDucky__hidden'}></img>
              <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}></img>
                <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}></img>
                 <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}></img>
                  <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}></img>
            <img className={`main__pillar-top-outline 
              ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={pillarTop} alt='pillar Shadow thing'></img>
            <img src={CrawlingBoxT1} className={`main__pillar-top ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarTopStyleWidth()} alt="william"></img>               
          </div>

          <div className="main__pillars-date-goal-wordcount-textarea-container">
          {/* Pillar LEFT starts here */}
              <div className={`main__pillar-left-container 
                ${this.props.rubberDucky ? 'rubberDucky__pillar-left-container' : ''}`}>
                {/* DUCK ICON */}
                <img src={duckIcon} alt="duck boi" style={this.duckAnimationStyle()} className={this.props.rubberDucky ? 'rubberDucky__icon' : 'rubberDucky__hidden'}></img>
                <img src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-left' : 'rubberDucky__hidden'} alt="rubberducky waterfall"></img>
              {/* Pillar Left Outline */}
                <img className={`main__pillar-left-outline 
                ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={this.props.rubberDucky ? WaterfallUp : nuPillarLeft} alt='pillar Shadow thing'></img>
                {/* Actual Pillar Left */}
                <img src={waveAnimation} className={`main__pillar-left ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarLeftStyleHeight()} alt="left pillar"></img>                
              </div>
              <div className="main__date-goal-wordcount-textarea-container">
                <div className="main__date-goal-wordcount-container">
                    <h3 className={`main__date ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>{this.state.date}</h3>
                    <h2 className={`main__goal ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`} >{`Goal:  ${this.state.goal} words`}</h2>
                    <h3 className={`main__wordcount ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>
                    {this.state.wordCount} Words</h3>
                </div>
                <textarea ref={textArea => this.textAreaContainer = textArea}
                 onChange={this.textNum}
                 className={`main__textarea ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}
                placeholder="note those thoughts here"></textarea>
              </div>
              {/* Pillar Right Starts */}
              <div className={`main__pillar-right-container 
                ${this.props.rubberDucky ? 'rubberDucky__pillar-right-container' : ''}`}>
                 <img src={duckIcon} alt="duck boi" style={this.duckAnimationStyle()} className={this.props.rubberDucky ? 'rubberDucky__icon' : 'rubberDucky__hidden'}></img>
                <img src={WaterfallUp} className= {this.props.rubberDucky ? 'rubberDucky__waterFall-right' :
                 'rubberDucky__hidden'}></img>
                  <img className={`main__pillar-right-outline 
                ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={pillarTest} alt='pillar Shadow thing'></img>
                < img src={waveAnimation} className={`main__pillar-right ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarRightStyleHeight()} alt="right pillar"></img>                

              </div>
            </div>

            {/* Pillar Bottom Starts Here */}
            <div className="main__pillar-bottom-container">
            {/* Pillar Bottom Rubber Ducky Images */}
            <img src={duckIcon} alt="duck boi" style={this.duckAnimationStyle()} className={this.props.rubberDucky ? 'rubberDucky__icon' : 'rubberDucky__hidden'}></img>

            <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom' : 'rubberDucky__hidden'}></img>
                 <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
                        <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
                            <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
                            <img src={WaterfallUp} className= 
              {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>

              <img className={`main__pillar-bottom-outline 
                ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={pillarTop} alt='pillar Shadow thing'></img>
                <img src={CrawlingBoxT1} className={`main__pillar-bottom ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarBottomStyleWidth()} alt="william"></img>               
            </div>
            <AudioPlayer rubberDucky={this.props.rubberDucky} />
            {/* <button onClick={this.props.rubberDuckyToggle}>BILLLLYYY</button>          */}
          </div>
          {/* Modal stuff is here */}
          <div className={`${this.state.modalIsOpen? "main__modal2OverlayOpen" : "main__modal2OverlayClosed"  }`} ref={div => this.modalOverlayContainer = div}></div>
          <div className={`${this.state.modalIsOpen? "main__modal2" : "main__modal2Closed" }`} ref={div => this.modalContentContainer = div} >
            <SuccessModal close={this.modalCloseAnimation} firstName={this.props.currentUser.firstName} conDays={this.props.currentUser.conDays} totDays={this.props.currentUser.totDays} />
          </div>
      </div>



      );
  }
}


 