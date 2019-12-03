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



import pillarTest from '../../assets/pillarTest.png'
import pillarTop from   '../../assets/pillarTop.png'
import CrawlingBoxL1 from '../../assets/CrawlingBoxL-1.png'
import CrawlingBoxT1 from '../../assets/CrawlingBoxT-1.png'
import CrawlingBox2 from '../../assets/CrawlingBox-2.png'
import CrawlingBox3 from '../../assets/CrawlingBox-3.png'
import AudioPlayer from '../../components/audioPlayer/audioPlayer.js'
import keySFXFile from '../../assets/Sounds/Not-Your-Thoughts-Keyboard-SFX-1.mp3'



const Header = posed.div({
  hidden: { opacity: 0.4 },
  visible: { opacity: 1 }
});

const startState = { autoAlpha: 0, y: -1000 };



export default class Main extends React.Component {
  
  p1CBoxArr = [CrawlingBoxL1,CrawlingBox2,CrawlingBox3]
  keySFX1 = new Audio(keySFXFile)

  randomNum = (max) =>{
    return Math.floor(Math.random() * max)
  }

  // const pillarAnim = () => {
  //   let increasing = true;
  //   if (increasing = true){
  //     for (let i = 0; i <=10; i++){
  //       console.log(i)

  //     }
  //   }
  // }
  // console.log(pillarAnim())

  state = {
    wordCount:0,
    charCount:0,
    limitReached:false, 
    date:moment().format("MM/DD/YYYY"),
    isVisible: true, 
    pillar1WordLimit:100,
    pillar2WordLimit:200,
    pillar3WordLimit:300,
    pillar4WordLimit:400,
    goal:400,
    pillar1ActiveCBox:this.p1CBoxArr[this.randomNum(2)]
  } 

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
      const start = {
        height:`0px`
      }
      const limit = {
        height:`380px`,
      }
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
        // opacity:`${this.state.wordCount/600}`
      };
      const start = {
        width:`0px`,
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
    textNum = (e) => {
        e.preventDefault()
        this.keySFX1.play()
        this.setState({
          wordCount: e.target.value.split(' ').length -1,
          charCount: e.target.value.split('').length
        })

        if (this.state.wordCount >= this.state.goal){
           this.setState({
               limitReached:true
           })
        }

    }
    componentDidMount(){
      setInterval(() => {
        this.setState({ isVisible: !this.state.isVisible,
          pillar1ActiveCBox:this.p1CBoxArr[this.randomNum(2)]
        });
      }, 20);
    }
    render(){
  // console.log(this.pillarRightStyleHeight())
  // console.log(this.pillarTopStyleWidth())
  // console.log(this.pillarBottomStyleWidth())


      return (
        <Transition
            unmountOnExit
            in={this.props.show}
            timeout={1000}
            onEnter={node => TweenMax.set(node,startState)}
            addEndListener={ (node, done) => {
              TweenMax.to(node, 0.5, {
                autoAlpha: this.props.show ? 1 : 0,
                y: this.props.show ? 0 : 50,
                onComplete: done
              });
            }}>
      <div className="main__all-container">
      <NavBarSide />
        
        <div className="main">

          <Header pose={this.state.isVisible ? 'visible' : 'hidden'} className="main__header">
            Not Your Thoughts
          </Header>
          <Prompt />
          <div className="main__pillar-top-container">
            <img className="main__pillar-top-outline" src={pillarTop} alt='pillar Shadow thing'></img>
            {/* <div className="main__pillar-top" style={this.pillarTopStyleWidth()}></div> */}
            <img src={CrawlingBoxT1} className="main__pillar-top" style={this.pillarTopStyleWidth()} alt="william"></img>                
          </div>

          <div className="main__pillars-date-goal-wordcount-textarea-container">
              <div className="main__pillar-left-container">
                <img className="main__pillar-left-outline" src={pillarTest} alt='pillar Shadow thing'></img>
                <img src={CrawlingBoxL1} className="main__pillar-left"style={this.pillarLeftStyleHeight()} alt="left pillar"></img>                
              </div>
              <div className="main__date-goal-wordcount-textarea-container">
                <div className="main__date-goal-wordcount-container">
                    <h3 className="main__date">{this.state.date}</h3>
                    <h2 className="main__goal" >{`Goal:${this.state.goal} words`}</h2>
                    {/* <h2 className="main__goal" >{`chars:${this.state.charCount}`}</h2> */}
                    <h3 className={`main__wordcount ${this.state.limitReached ? "main__limit":""}`}>
                    {this.state.wordCount} Words</h3>
                </div>
                <textarea onChange={this.textNum} className="main__textarea"
                placeholder="note those thoughts here"></textarea>
              </div>
              <div className="main__pillar-right-container">
                <img className="main__pillar-right-outline" src={pillarTest} alt='pillar Shadow thing'></img>
                <div className="main__pillar-right" style={this.pillarRightStyleHeight()}></div>
              </div>
            </div>
            <div className="main__pillar-bottom-container">
              <img className="main__pillar-bottom-outline" src={pillarTop} alt='pillar Shadow thing'></img>
              <div className="main__pillar-bottom" style={this.pillarBottomStyleWidth()}>billy hilly</div>                
            </div>
            <AudioPlayer />
          </div>
      </div>

        </Transition>


      );
  }
}


 