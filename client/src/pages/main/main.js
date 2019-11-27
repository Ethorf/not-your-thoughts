import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './main.scss';
import '../../styles/mixins.scss'
import Prompt from '../../components/prompt/prompt'
import moment from 'moment'



export default class Main extends React.Component {

    state = {
        wordCount:0,
        limitReached:false, 
        date:moment().format("MM/DD/YYYY")
    }
    textNum = (e) => {
        e.preventDefault()
        this.setState({
          wordCount: e.target.value.split(' ').length -1
        })

        if (this.state.wordCount >= 10){
           this.setState({
               limitReached:true
           })
        }
    }
    render(){
        return (
            <div className="main">
              <header className="main__header">
                Not Your Thoughts
              </header>
              <Prompt className="main__prompt" />
              <div className="main__date-goal-wordcount-textarea-container">
                <div className="main__date-goal-wordcount-container">
                    <h3 className="main__date">{this.state.date}</h3>
                    <h2 className="main__goal">Goal: 500 words</h2>
                    <h3 className={`main__wordcount
                     ${this.state.limitReached ? "main__limit":""}`}>{this.state.wordCount} Words</h3>
                </div>
              <textarea onChange={this.textNum} className="main__textarea" placeholder="note those thoughts here"></textarea>
              </div>
            </div>
          );
    }

}


 