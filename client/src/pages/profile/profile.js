import React from 'react';
import './profile.scss';
import '../../styles/mixins.scss'
import '../../styles/rubberDucky.scss'



export default class Profile extends React.Component{
    render(){
        return(
            <div className={`profile ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>
                <div className={`profile__content ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>
                    <header className={`profile__header ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>User Profile</header>
                    <h2 className={`profile__user ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>User: {this.props.currentUser.firstName} Thorfinnson</h2>
                    <h2 className={`profile__consecutive-days ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>Consecutive Days Completed: {this.props.currentUser.conDays}</h2>
                    <h2 className={`profile__total-days ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>Total Days Completed: {this.props.currentUser.totDays}</h2>
                    <h2 className={`profile__achievements-unlocked ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>Achievments Unlocked</h2>
                    <div className="profile__achievement-container">
                        <div className="profile__achievement-mode-container">
                            <h2 className={`profile__rubber-ducky-requirement ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>3 Consecutive Days--->  </h2>
                            <h2 className={`profile__rubber-ducky-title ${this.props.currentUser.conDays >= 3 ? " " : "strikethrough"}`}> Rubber Ducky Mode</h2>
                            <button onClick={this.props.rubberDuckyToggle} className={`profile__rubber-ducky-activate-button ${this.props.currentUser.conDays >= 3 ? " " : "rubberDucky__hidden"}`}>{`${this.props.rubberDucky ? "Deactivate" : "Activate"}`}</button>
                        </div>
                        <div className="profile__achievement-mode-container">
                            <h2 className={`profile__rubber-ducky-requirement ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>5 Consecutive Days--->  </h2>
                            <h2 className={`profile__bullshittify-title ${this.props.currentUser.conDays >= 5 ? " " : "strikethrough"}`}> Bullsh*tiffy Mode</h2>
                        </div>
                        <div className="profile__achievement-mode-container">
                            <h2 className={`profile__rubber-ducky-requirement ${this.props.rubberDucky ? "rubberDucky__blackText" : ""}`}>7 Consecutive Days--->  </h2>
                            <h2 className={`profile__rpg-title ${this.props.currentUser.conDays >= 7 ? " " : "strikethrough"}`}> RPG Mode</h2>
                        </div>
                    </div>
                </div>
                <div className={`profile__bottom-chunk ${this.props.rubberDucky ? "yellow" : ""}`}></div>    
            </div>
            
        )
    }
}