import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './prompt.scss';



export default class Prompt extends React.Component {
  randomNum = (max) =>{
    return Math.floor(Math.random() * max)
  }
    promptArr = [
      "Note not only the content of your thoughts, but the physical sensations accompanying them.",
      "Try describing only the physical sensations generated by your thoughts, and where they appear in your body",
      "Try to localize the centre of your being, where is the I coming from? ",
      "Think of a recent difficult situation you encountered, and narrate the story from the other person's perspective",
      "Reflect on some obstacles you have recently overcome"
    ]

     promptContent = this.promptArr[this.randomNum(this.promptArr.length-1)]

    render(){
        return (
            <div className="prompt">
              <h2>{this.promptContent}</h2>
            </div>
          );
    }
  }
