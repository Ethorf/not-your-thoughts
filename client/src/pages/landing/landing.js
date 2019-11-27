import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './landing.scss'
import Main from '../main/main'

export default class Landing extends React.Component {
    render() {
        return (
            <div className="landing">
              <h2 className="landing__you-are">You are</h2>
              <h1 className="landing__title">Not Your Thoughts</h1>
                <div className="landing__description-container">
                    <p className="landing__description">Not Your Thoughts is a mindfullness-based gamified journalling website 
                        dedicated to empowering the average human to develop a
                        healthy relationship with "their" thoughts. Through
                        consistent daily practice, our highest goal is to bokasodgkaosd baosdg aosdiga osdi 
                          </p>
                </div>
                    <button className="landing__start-button-container">
                        <Link exact to="/main" className="landing__start-button">Start</Link>
                    </button>
            </div>
        )
    }
}
