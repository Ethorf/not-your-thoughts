import React from 'react';
import './audioPlayer.scss'
import Song from '../../assets/Sounds/Not-Your-Thoughts-Ambient-Track-1.mp3'
import UIfx from 'uifx'
import keyPressFile1 from '../../assets/Sounds/Not-Your-Thoughts-Keyboard-SFX-1.mp3'
import pause from '../../assets/Icon-pause.png'
import play from '../../assets/Icon-play.png'
import speaker from '../../assets/speaker.png'
import { TimelineLite, CSSPlugin } from "gsap/all";




const keyPress = new UIfx(keyPressFile1,{
    volume: 0.5, // value must be between 0.0 ⇔ 1.0
    throttleMs: 50
  });

const audioPlayerAllContainer = null;
const audioPlayerAllTween = null;
const speakerContainer = null;
const speakerTween = null;
const controlsContainer = null;
const controlsTween = null;


export default class AudioPlayer extends React.Component {


    state = {
        play: false,
        volume:0.5,
        navOpen : false
      }

      music = new Audio(Song)

      decreaseVolume=() => {
        this.music.volume = this.music.volume+0.1;
        console.log(this.music.volume)
      }
      increaseVolume=() => {
        this.music.volume = this.music.volume-0.1;
        console.log(this.music.volume)
      }

    
    
      togglePlay = () => {
        this.setState({ play: !this.state.play }, () => {
          this.state.play ? this.music.play() : this.music.pause();
        }); 
        console.log(this.music.volume)
      }


    openNav = () =>{
        this.audioPlayerAllTween.play()
        this.controlsTween.play()
        this.speakerTween.play()

        this.setState({
            navOpen:true
        })
    }

    closeNav = () =>{
        this.audioPlayerAllTween.reverse()
        this.controlsTween.reverse()
        this.speakerTween.reverse()
        this.setState({
            navOpen:false
        })
    }
 
    componentDidMount() {
        this.music.addEventListener('ended', () => this.setState({ play: false }));
        this.music.volume = 0.5;

        this.audioPlayerAllTween = new TimelineLite({ paused:true })
        .to(this.audioPlayerAllContainer, {duration:2, x: -150,ease: "power1.out" })

        this.controlsTween = new TimelineLite({ paused:true })
        .to(this.controlsContainer, {duration:1,x:0,opacity:1 })

        this.speakerTween = new TimelineLite({ paused:true })
        .to(this.speakerContainer, {duration:2,rotation: -180 ,opacity:1,color:"white" })


        
      }
    
      componentWillUnmount() {
        this.music.removeEventListener('ended', () => this.setState({ play: false }));  
      }
    render(){
        // console.log(keyPress)
        return (
            <div className="audioPlayer" ref={div=> this.audioPlayerAllContainer = div}>
            <button className="audioPlayer__speaker-container" onClick={this.state.navOpen? this.closeNav : this.openNav } >
            <img src={speaker} ref={img=> this.speakerContainer = img} alt='speaker' className="audioPlayer__speaker"></img>
            </button>
                <div className="audioPlayer__controls-container" ref={div => this.controlsContainer = div}>
                    <button className="audioPlayer__play-pause" onClick={this.togglePlay}><img src={this.state.play ? pause : play}></img></button>
                    <button className="audioPlayer__increase-vol" onClick={this.increaseVolume}>-</button>
                    <button className="audioPlayer__decrease-vol" onClick={this.decreaseVolume}>+</button>
                </div>
                
            </div>
        )
    }
}
    