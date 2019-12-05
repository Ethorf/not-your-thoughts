import React from 'react';
import { Link } from 'react-router-dom';
import './landing.scss'
// import Main from '../main/main'
import { TimelineLite, CSSPlugin } from "gsap/all";
// import { TweenMax, TweenLite } from "gsap/all";
// import { Transition } from "react-transition-group";


// declaring all initial animation vars

const allContainer = null;
const allTween = null;
const logoContainer = null;
const logoTween = null;
const notContainer = null;
const notTween = null;
const yourContainer = null;
const yourTween = null;
const thoughtsContainer = null;
const thoughtsTween = null;
const descriptionContainer = null;
const descriptionTween = null;
const buttonContainer = null;
const buttonTween = null;
const startState = { autoAlpha: 0, y: -1000 };


export default class Landing extends React.Component {

        componentDidMount(){
            // create logo tween
            //this is essentially where the animation is created
            this.logoTween = new TimelineLite({ paused:true })
            .to(this.logoContainer, {duration:2, y: 80,ease: "power1.out", opacity:1 })
            this.logoTween.play()

            this.notTween = new TimelineLite({ paused:true })
            .to(this.notContainer, {duration:3, x: 150, opacity:1 })
            setTimeout(()=>{this.notTween.play()},800)

            this.yourTween = new TimelineLite({ paused:true })
            .to(this.yourContainer, {duration:2, y: -100, opacity:1 })
            setTimeout(()=>{this.yourTween.play()},1200)

            this.thoughtsTween = new TimelineLite({ paused:true })
            .to(this.thoughtsContainer, {duration:2, x: -100, opacity:1 })
            setTimeout(()=>{this.thoughtsTween.play()},1800)

            this.descriptionTween = new TimelineLite({ paused:true })
            .to(this.descriptionContainer, {duration:3,y:-1, opacity:1 })
            setTimeout(()=>{this.descriptionTween.play()},4200)

            this.buttonTween = new TimelineLite({ paused:true })
            .to(this.buttonContainer, {duration:5,y:-1,ease: "slow(0.7, 0.7, false)", opacity:1 })
            setTimeout(()=>{this.buttonTween.play()},9000)

            this.allTween = new TimelineLite({ paused:true })
            .to(this.allContainer, {duration:6, y: -100, opacity:1 })
            setTimeout(()=>{this.allTween.play()},5000)

            setTimeout(()=>{this.logoTween.reverse()},2700)

        }
    render() {

        return (

            <div ref={ div => this.allContainer = div } className="landing">
              <h2 ref={ img => this.logoContainer = img } className="landing__you-are">You are</h2>
              <h1 className="landing__title">
                <div className="landing__title-not" ref={h1 => this.notContainer = h1}>Not</div>
                <div className="landing__title-your" ref={h1 => this.yourContainer = h1}>Your{" "}</div>
                <div className="landing__title-thoughts" ref={h1 => this.thoughtsContainer = h1}>Thoughts{" "}</div>
            </h1>
                <div className="landing__description-container">
                    <p ref={ p => this.descriptionContainer = p } className="landing__description">Not Your Thoughts is a mindfulness-based gamified journaling website 
                        dedicated to empowering the average human to develop a
                        healthy relationship with the whirlwind of thoughts they find themselves inside daily. Through a
                        consistent daily journaling practice and engagement with mindfulness prompts,
                         the user will unlock new modes, features, and achievements as they progress towards
                          the solidification of their practice.
                          </p>
                </div>
                    <button ref={ button => this. buttonContainer = button } className="landing__start-button-container">
                        <Link to="/main" exact className="landing__start-button">Start</Link>
                    </button>
            </div>


        )
    }
}
