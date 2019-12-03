import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './resources.scss';
import '../../styles/mixins.scss'
import Prompt from '../../components/prompt/prompt'
import posed from 'react-pose';
import moment from 'moment'
import NavBarSide from '../../components/nav/navBarSide.js'
import { TweenMax } from "gsap/all";
import { Transition } from "react-transition-group";


export default class Resources extends React.Component{

    pillarAnim = (max) => {
        let one = 1
        let two = 2
        // for (let i =0;i <=max;i++){
        //     j.push(i)
        // }
        return one;
    }
    render(){

        console.log(this.pillarAnim(10))
        return(
            <div className="resources">

                < NavBarSide />
                <div className="resources__mindfulness-container">
                    <h1 className="resources__mindfulness-title">Mindfulness</h1>
                        <div className="resources__mindfulness-content">
                            <h2 className="resources__mindfulness-title">10% Happier</h2>
                            <h3 className="resources__mindfulness-authour">Dan Harris</h3>
                        </div>    
                    </div>   
            </div>
            
        )
    }
}