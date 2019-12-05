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

    render(){

        return(
            <div className="resources">
                < NavBarSide />
                <h1 className="resources__title">Resources</h1>

            <div className="resources__content-container">
                    
                    
                    <div className="resources__mindfulness-container">
                        <h2 className="resources__mindfulness-title">Mindfulness / Meditation</h2>
                        <div className="resources__mindfulness-content">
                            <h4 className="resources__mindfulness-content-title">10% Happier - Dan Harris</h4>
                        </div>    
                    </div>
                    <div className="resources__journalling-container">
                        <h2 className="resources__journalling-title">Journalling</h2>
                        <div className="resources__journalling-content">
                            <h4 className="resources__journalling-content-title">10% Happier - Dan Harris</h4>
                        </div>    
                    </div>
                    <div className="resources__gamification-container">
                        <h2 className="resources__gamification-title">Gamification</h2>
                        <div className="resources__gamification-content">
                            <h4 className="resources__gamification-content-title">Superbetter - Jane McGonigal</h4>
                        </div>    
                    </div>
                </div>       
            </div>
            
        )
    }
}