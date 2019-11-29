import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './main.scss';
import '../../styles/mixins.scss'
import Prompt from '../../components/prompt/prompt'
import posed from 'react-pose';
import moment from 'moment'
import pillarTest from '../../assets/pillarTest.png'
import pillarTop from   '../../assets/pillarTop.png'
import CrawlingBoxL1 from '../../assets/CrawlingBoxL-1.png'
import CrawlingBox2 from '../../assets/CrawlingBox-2.png'
import CrawlingBox3 from '../../assets/CrawlingBox-3.png'



const Header = posed.div({
  hidden: { opacity: 0.9 },
  visible: { opacity: 1 }
});

const fiHund = 30;



export default class Main extends React.Component {
    
  p1CBoxArr = [CrawlingBoxL1,CrawlingBox2,CrawlingBox3]

  

  state = {
    wordCount:0,
    charCount:0,
    limitReached:false, 
    date:moment().format("MM/DD/YYYY"),
    isVisible: true, 
    pillar1CharLimit:94,
    pillar2CharLimit:590,
    pillar3CharLimit:1035,
    pillar4CharLimit:1400,
    pillar1WordLimit:100,
    pillar2WordLimit:200,
    pillar3WordLimit:300,
    pillar4WordLimit:400,
    goal:400,
    pillar1ActiveCBox:this.p1CBoxArr[this.randomNum(2)]
  } 

  

    styleChamp = () =>{
      const testStyle = {
        fontSize:`${this.state.wordCount + 30}px`,
      };
      return testStyle

    }
    pillarLeftStyleHeight = () =>{
      const testStyle = {
        height:`${(this.state.wordCount +1)*5.5}px`,
        bottom:`${(this.state.wordCount +5)*5.5}px`,
        opacity:`${this.state.wordCount/80}`
      };
      const limit = {
        height:`580px`,
        bottom:'580px'
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
        height:`${(-842 + this.state.charCount )*3}px`,
        opacity:`${this.state.charCount/80}`
      };
      const start = {
        height:`0px`,
      }
      const limit = {
        height:`100%`,
      }
      if (this.state.charCount <= this.state.pillar2CharLimit){
        return start
      } else if(this.state.charCount >= this.state.pillar2CharLimit && this.state.charCount <= this.state.pillar3CharLimit  ) {
        return testStyle
      }
      else{
        return limit
      }
    }

    pillarBottomStyleWidth = () =>{
      const testStyle = {
        width:`${-3100+(this.state.charCount +1)*3}px`,
        left:`${4300 -( this.state.charCount*3)}px`,
        opacity:`${this.state.charCount/80}`
      };
      const start = {
        width:`0px`,
      }
      const limit = {
        width:`1103px`,left:'100px'
      }
      if (this.state.charCount <= this.state.pillar3CharLimit){
        return start
      } else if(this.state.charCount >= this.state.pillar3CharLimit && this.state.charCount <= this.state.pillar4CharLimit  ) {
        return testStyle
      }
      else{
        return limit
      }
    }
    textNum = (e) => {
        e.preventDefault()
        this.setState({
          wordCount: e.target.value.split(' ').length -1,
          charCount: e.target.value.split('').length
        })

        if (this.state.wordCount >= 10){
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

    // componentDidUpdate(){
    //   this.set
    // }
    render(){
  // console.log(this.pillarRightStyleHeight())
  // console.log(this.pillarTopStyleWidth())
  console.log(this.pillarBottomStyleWidth())


      return (
        <div className="main">
          <Header pose={this.state.isVisible ? 'visible' : 'hidden'} className="main__header">
            Not Your Thoughts
          </Header>
          <Prompt className="main__prompt" />
          <div className="main__pillar-top-container">
            <img className="main__pillar-top-outline" src={pillarTop} alt='pillar Shadow thing'></img>
            <div className="main__pillar-top" style={this.pillarTopStyleWidth()}></div>
            {/* <img src={this.CrawlingBox1} className="main__pillar-top" style={this.pillarTopStyleWidth()} alt="william"></img>                 */}

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
          </div>

      );
  }
}


 