import React from 'react';
import './main.scss';
import '../../styles/mixins.scss'
import Prompt from '../../components/prompt/prompt'
import posed from 'react-pose';
import moment from 'moment'
import SuccessModal from '../../components/Modals/successModal';
import '../../components/Modals/successModal.scss';
import bgOverlayTextureWhite from '../../assets/Background-Images/bgImg-donut1.png'
import progressSound25File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-25-progressSound.mp3'
import progressSound50File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-50-progressSound.mp3'
import progressSound75File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-75-progressSound.mp3'
import progressSound100File from '../../assets/Sounds/ProgressSounds/Not-Your-Thoughts-100-progressSound.mp3'
import WaterfallUp from '../../assets/RubberDucky/waterFall.gif'
import duckIcon from '../../assets/RubberDucky/duckIcon-nolegs.gif'
import nuPillarLeft from '../../assets/Pillars/PillarLeft-5-shadowboi.png'
import pillarTop from   '../../assets/Pillars/PillarTop-7-shadowboi.png'
import crawBox from '../../assets/Pillars/nuCrawBoxAnim-1.gif'
import crawBoxTop from '../../assets/Pillars/NuCrawBoxAnim-2-top.gif'
import crawBoxRight from '../../assets/Pillars/NuCrawBoxAnim-2-right.gif'
import crawBoxBottom from '../../assets/Pillars/NuCrawBoxAnim-2-bottom.gif'
import '../../styles/rubberDucky.scss'
import finishLine from '../../assets/RubberDucky/finish.png'
import startLine from '../../assets/RubberDucky/start.png'
import { TimelineLite} from "gsap/all";




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
const pillarContainer = null;
const pillarTween = null;


//Header animation
const Header = posed.div({
  hidden: { opacity: 0.4 },
  visible: { opacity: 1 }
});

export default class Main extends React.Component {

  //Audio Progress Variables
  progressSound25 = new Audio(progressSound25File)
  progressSound50 = new Audio(progressSound50File)
  progressSound75 = new Audio(progressSound75File)
  progressSound100 = new Audio(progressSound100File)

  state = {
    wordCount:0,
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
        opacity:`${this.state.wordCount/40}`
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
        width:`${(-100 + this.state.wordCount)-1}%`,
        opacity:`${this.state.wordCount/200}`

      };
      const start = { width:`0%`}
      const limit = {width:`98%`}
      if (this.state.wordCount <= this.state.pillar1WordLimit){
        return start
      } else if (this.state.wordCount >= this.state.pillar1WordLimit && this.state.wordCount <= this.state.pillar2WordLimit  ) {
        return testStyle
      } else {
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
      } else {
        return limit
      }
    }
    pillarBottomStyleWidth = () =>{
      const testStyle = {
        width:`${(-300 + this.state.wordCount)+1}%`,
        left:`${99-((-300 + this.state.wordCount)+1)}%`
      };
      const start = {
        width:`0%`, left:"99%"}
      const limit = {
        width:`99%`, left:"0%"}
      if (this.state.wordCount <= this.state.pillar3WordLimit){
        return start
      } else if(this.state.wordCount >= this.state.pillar3WordLimit && this.state.wordCount <= this.state.pillar4WordLimit  ) {
        return testStyle
      } else {
        return limit
      }
    }
    ////////  Rubber Ducky Functions / Animations 

    duckAnimationStyle = () =>{

      const upStyle = {
        top:`${65-(this.state.wordCount/2.2)}%`,
      };
      const rightStyle = {
        top:'24%',
        left:`${-54+(this.state.wordCount/1.5)}%`
      };
      const downStyle = {
        top:`${-45 +(this.state.wordCount/2.6)}%`,
        left:`79%`,
      };
      const leftStyle = {
        top:`74%`,        
        left:`${252-(this.state.wordCount/1.7)}%`
      };
      const limit = {
        top:`74%`,      
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
    //Modal and Misc Animations
    bgPulse = () => {
      this.bgImgTween.play()
        setTimeout(()=>{
          this.bgImgTween.reverse()
        },1800)
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

    componentDidMount(){
      setInterval(() => {
        this.setState({ isVisible: !this.state.isVisible, 
        })
      }, 20);

      //Background Img pulsing
      setInterval(()=>{
        this.bgPulse()
      },12000)

      //Animation containers / Declarations
      this.progressNumberTween = new TimelineLite({ paused:true })
      .to(this.progressNumberContainer, {duration:1.5,opacity:1 })

      this.progressWordTween = new TimelineLite({ paused:true })
      .to(this.progressWordContainer, {duration:1.5,opacity:1 })

      this.modalContentTween = new TimelineLite({ paused:true })
      .to(this.modalContentContainer, {duration:1,y:100,opacity:1 })

      this.modalOverlayTween = new TimelineLite({ paused:true })
      .to(this.modalOverlayContainer, {duration:1,opacity:1 })

      this.bgImgTween = new TimelineLite({ paused:true })
      .to(this.bgImgContainer, {duration:3.3,opacity:0.48 })

      this.pillarTween = new TimelineLite({ paused:true })
      .to(this.pillarContainer, {duration:2.3,opacity:0.15 })

    }

    
    componentDidUpdate(){

      
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
                  <img src={duckIcon} alt="duck boi" style={this.duckAnimationStyle()} className={this.props.rubberDucky ? 'rubberDucky__icon' : 'rubberDucky__hidden'}></img>
          <img alt="" ref={img=> this.bgImgContainer = img}  className={`main__bg-img ${this.props.rubberDucky? 'rubberDucky__hidden' : ''}`} src={bgOverlayTextureWhite}></img>
          <div className={`main ${this.props.rubberDucky ? 'rubberDucky' : 'black'}`}>
            <Header rubberDucky={this.props.rubberDucky} pose={this.state.isVisible ? 'visible' : 'hidden'}
                    className={`main__header ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>
              Not Your Thoughts
            </Header >
           
            <Prompt rubberDucky={this.props.rubberDucky} />
            <h2 ref={h2=> this.progressNumberContainer = h2} className={` ${this.props.rubberDucky ? "rubberDucky__blackText-prognum" : "main__progress-number"}`}>{this.percentCalc(this.state.wordCount)}</h2>
            <h2 ref={h2=> this.progressWordContainer = h2} className={` ${this.props.rubberDucky ? "rubberDucky__blackText-progword" : "main__progress-word"}`}>Complete</h2>
            {/* Pillar TOP container */}
            <div className="main__pillar-top-container">
            {/* Pillar TOP Rubber Ducky Images Start */}
              <img src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-top' : 'rubberDucky__hidden'} alt=""></img>
                <img src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
                  <img src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
                  <img src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
                    <img src={WaterfallUp} className= {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'} alt=""></img>
                    <img src={WaterfallUp} className= {this.props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'} alt=""></img>

              <img className={`main__pillar-top-outline 
                ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={pillarTop} alt='pillar Shadow thing'></img>
              <img ref={img=> this.pillarContainer = img} src={crawBoxTop} className={`main__pillar-top ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarTopStyleWidth()} alt="william"></img>               
            </div>

            <div className="main__pillars-date-goal-wordcount-textarea-container">
            {/* Pillar LEFT starts here */}
            <img alt="" src={startLine} className= 
                {this.props.rubberDucky ? 'rubberDucky__startLine' : 'rubberDucky__hidden'}></img>
                <div className={`main__pillar-left-container 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-left-container' : ''}`}>
                  {/* DUCK ICON */}
                  <img src={WaterfallUp} className= 
                  {this.props.rubberDucky ? 'rubberDucky__waterFall-left' : 'rubberDucky__hidden'} alt="rubberducky waterfall"></img>
                {/* Pillar Left Outline */}
                  <img className={`main__pillar-left-outline 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={this.props.rubberDucky ? WaterfallUp : nuPillarLeft} alt='pillar Shadow thing'></img>
                  {/* Actual Pillar Left */}
                  <img ref={img=> this.pillarContainer = img} src={crawBox} className={`main__pillar-left ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarLeftStyleHeight()} alt="left pillar"></img>                
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
                  className={`main__textarea ${this.props.rubberDucky ? "rubberDucky__blackText" : "textarea-black"}`}
                  placeholder="note those thoughts here"></textarea>
                </div>
                {/* Pillar Right Starts */}
                <div className={`main__pillar-right-container 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-right-container' : ''}`}>
                  <img alt="" src={WaterfallUp} className= {this.props.rubberDucky ? 'rubberDucky__waterFall-right' :
                  'rubberDucky__hidden'}></img>
                    <img className={`main__pillar-right-outline 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={nuPillarLeft} alt='pillar Shadow thing'></img>
                  < img ref={img=> this.pillarContainer = img} src={crawBoxRight} className={`main__pillar-right ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarRightStyleHeight()} alt="right pillar"></img>                

                </div>
              </div>
              {/* Pillar Bottom Starts Here */}
              <div className="main__pillar-bottom-container">
              {/* Pillar Bottom Rubber Ducky Images */}
              <img alt="" src={WaterfallUp} className= 
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
                  <img ref={img=> this.pillarContainer = img} src={crawBoxBottom} className={`main__pillar-bottom ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarBottomStyleWidth()} alt="william"></img>               
              </div>
              {/* <button onClick={this.props.rubberDuckyToggle}>BILLLLYYY</button>         */}
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


 