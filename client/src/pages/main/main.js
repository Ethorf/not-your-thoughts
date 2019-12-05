import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './main.scss';
import '../../styles/mixins.scss'
import Prompt from '../../components/prompt/prompt'
import posed from 'react-pose';
import moment from 'moment'
import NavBarSide from '../../components/nav/navBarSide.js'
import { TweenMax } from "gsap/all";
import { Transition } from "react-transition-group";
import SuccessModal from '../../components/successModal/successModal';
import '../../components/successModal/successModal.scss';
import Modal from 'react-modal';
import pillarTest from '../../assets/pillarTest.png'
import pillarTop from   '../../assets/pillarTop.png'
import CrawlingBoxT1 from '../../assets/CrawlingBoxT-1.png'
import bgOverlayTextureWhite from '../../assets/Background-Images/background-texture-bigPan-white-blur.png'
import waveAnimation from '../../assets/waveAnimationFull.gif'
import AudioPlayer from '../../components/audioPlayer/audioPlayer.js'
import keySFXFile from '../../assets/Sounds/Not-Your-Thoughts-Keyboard-SFX-1.mp3'
import progressSound25File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-25-progressSound.mp3'
import progressSound50File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-50-progressSound.mp3'
import progressSound75File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-75-progressSound.mp3'
import progressSound100File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-100-progressSound.mp3'


import { TimelineLite, CSSPlugin } from "gsap/all";

Modal.setAppElement('body')


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

// const BgImg = posed.div({
//   hidden: { opacity: 0.02 },
//   visible: { opacity:0.07 }

// })

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
    rubberDucky:false,
    modalIsOpen: false,
    goalReached:false,
    currentUser:{
      firstName:"Eric",
      lastName:"Thorfinnson",
      conDays:"2",
      totDays:"3"
    }
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
        height:`${(this.state.wordCount +1)*3.8}px`,
        bottom:`${(this.state.wordCount +1)*3.8}px`,
        opacity:`${this.state.wordCount/10}`
      };
      const limit = {
        height:`380px`,
        bottom:'380px'
      }
      if (this.state.wordCount <= this.state.pillar1WordLimit){
        return testStyle
      } else {
        return limit
      }
    }
    pillarTopStyleWidth = () =>{
      const testStyle = {
        width:`${(-97 + this.state.wordCount)*12.5}px`,
        left:'1px'
        // opacity:`${this.state.charCount/80}`
      };
      const start = {
        width:`0px`, left:'1px'
      }
      const limit = {
        width:`99%`, left:'1px'
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
        height:`${(-200 + this.state.wordCount )*3.6}px`
      };
      const start = {height:`0px`}
      const limit = {height:`380px`}
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
        width:`${-3850+(this.state.wordCount +1)*12.8}px`,
        left:`${5150 -( this.state.wordCount*12.8)}px`
        ,opacity:"1"
      };
      const start = {
        width:`0px`,left:'5120',opacity:"0"
      }
      const limit = {
        width:`1303px`,left:'20px'
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
          },2000)
    }
    componentDidMount(){
      setInterval(() => {
        this.setState({ isVisible: !this.state.isVisible, 
        })
      }, 20);
      setInterval(()=>{
        this.bgPulse()
      },15000)

      this.progressNumberTween = new TimelineLite({ paused:true })
      .to(this.progressNumberContainer, {duration:1.5,opacity:1 })

      this.progressWordTween = new TimelineLite({ paused:true })
      .to(this.progressWordContainer, {duration:1.5,opacity:1 })

      this.modalContentTween = new TimelineLite({ paused:true })
      .to(this.modalContentContainer, {duration:1,y:100,opacity:1 })

      this.modalOverlayTween = new TimelineLite({ paused:true })
      .to(this.modalOverlayContainer, {duration:1,opacity:1 })

      this.bgImgTween = new TimelineLite({ paused:true })
      .to(this.bgImgContainer, {duration:4,opacity:0.5 })

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
    rubberDuckyToggle=(prevProps,prevState)=>{
      this.setState(prevState => ({
        rubberDucky: !prevState.rubberDucky
      }));
      console.log(this.state.rubberDucky)
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
        this.modalAnimation()
        setTimeout(()=>{
          this.setState({
            wordCount:401
          })
          this.modalCloseAnimation()
        },4000)
      },4000)
 
    }
  }
    render(){

      return (  
       
      <div className="main__all-container modalize">
      <NavBarSide />
        {/* <div className="main__bg"></div> */}

        <img ref={img=> this.bgImgContainer = img}  className="main__bg-img" src={bgOverlayTextureWhite}></img>

          

        <div className={`main ${this.state.rubberDucky ? 'rubberDucky' : 'black'}`}>
          <Header pose={this.state.isVisible ? 'visible' : 'hidden'} className="main__header">
            Not Your Thoughts
          </Header>
          <Prompt />
          <h2 ref={h2=> this.progressNumberContainer = h2} className="main__progress-number">{this.percentCalc(this.state.wordCount)}</h2>
          <h2 ref={h2=> this.progressWordContainer = h2} className="main__progress-word">Complete</h2>

          <div className="main__pillar-top-container">
            <img className="main__pillar-top-outline" src={pillarTop} alt='pillar Shadow thing'></img>
            <img src={CrawlingBoxT1} className="main__pillar-top" style={this.pillarTopStyleWidth()} alt="william"></img>                
          </div>

          <div className="main__pillars-date-goal-wordcount-textarea-container">
              <div className="main__pillar-left-container">
                <img className="main__pillar-left-outline" src={pillarTest} alt='pillar Shadow thing'></img>
                <img src={waveAnimation} className="main__pillar-left"style={this.pillarLeftStyleHeight()} alt="left pillar"></img>                
              </div>
              <div className="main__date-goal-wordcount-textarea-container">
                <div className="main__date-goal-wordcount-container">
                    <h3 className="main__date">{this.state.date}</h3>
                    <h2 className="main__goal" >{`Goal:  ${this.state.goal} words`}</h2>
                    <h3 className={`main__wordcount ${this.state.limitReached ? "main__limit":""}`}>
                    {this.state.wordCount} Words</h3>
                </div>
                <textarea ref={textArea => this.textAreaContainer = textArea} onChange={this.textNum} className="main__textarea"
                placeholder="note those thoughts here"></textarea>
              </div>
              <div className="main__pillar-right-container">
                <img className="main__pillar-right-outline" src={pillarTest} alt='pillar Shadow thing'></img>
                <div className="main__pillar-right" style={this.pillarRightStyleHeight()}></div>
              </div>
            </div>
            <div className="main__pillar-bottom-container">
              <img className="main__pillar-bottom-outline" src={pillarTop} alt='pillar Shadow thing'></img>
              <div className="main__pillar-bottom" style={this.pillarBottomStyleWidth()}></div>                
            </div>
            <AudioPlayer />
            <button onClick={this.rubberDuckyToggle}>BILLLLYYY</button>

         
          </div>
          <div className={`${this.state.modalIsOpen? "main__modal2OverlayOpen" : "main__modal2OverlayClosed"  }`} ref={div => this.modalOverlayContainer = div}>

          </div>
          <div className="main__modal2" ref={div => this.modalContentContainer = div} >
          <button onClick={this.modalCloseAnimation}>BILLLLYYY</button>
          <SuccessModal firstName={this.state.currentUser.firstName} conDays={this.state.currentUser.conDays} conDays={this.state.currentUser.totDays} />
          TESTINO</div>
      </div>

    // </Transition>


      );
  }
}


 