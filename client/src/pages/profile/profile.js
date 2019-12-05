import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './profile.scss';
import '../../styles/mixins.scss'
import moment from 'moment'
import NavBarSide from '../../components/nav/navBarSide.js'
import { TweenMax } from "gsap/all";



export default class Profile extends React.Component{

    render(){
        return(
            <div className="profile">

            < NavBarSide />
                <div className="profile__content">
                    <h1 className="profile__user">User:Eric Thorfinnson</h1>
                    <h2 className="profile__consecutive-days">3</h2>
                    <h2 className="profile__total-days">4</h2>
                    <h2 className="profile__achievements-unlocked">Rubber ducky</h2>
                </div>    
            </div>
            
        )
    }
}