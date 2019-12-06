import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './profile.scss';
import '../../styles/mixins.scss'
import moment from 'moment'
import NavBarSide from '../../components/nav/navBarSide.js'
import { TweenMax } from "gsap/all";



export default class Profile extends React.Component{
    onClick = () => {
        console.log("bob")
    }
    render(){
        return(
            <div className="profile">

            < NavBarSide />
                <div className="profile__content">
                    <header className="profile__header">User Profile</header>
                    <h2 className="profile__user">User: {this.props.currentUser.firstName} Thorfinnson</h2>
                    <h2 className="profile__consecutive-days">Consecutive Days Completed: {this.props.currentUser.conDays}</h2>
                    <h2 className="profile__total-days">Total Days Completed: {this.props.currentUser.totDays}</h2>
                    <h2 className="profile__achievements-unlocked">Achievments Unlocked</h2>
                    <div className="profile__achievement-container">
                        <h2 className="profile__rubber-ducky-requirement">3 Consecutive Days--->  </h2>
                        <h2 className={`profile__rubber-ducky-title ${this.props.rubberDuckyUnlocked ? " " : "strikethrough"}`}> Rubber Ducky Mode</h2>
                        <button onClick={this.props.increaseDays} className="profile__rubber-ducky-activate-button">Activate</button>
                    </div>
                </div>    
            </div>
            
        )
    }
}