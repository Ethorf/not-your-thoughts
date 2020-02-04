import React from 'react';
import './audioPlayer.scss'
import Song from '../../assets/Sounds/Not-Your-Thoughts-Ambient-Track-1.mp3'
import RubberDuckySong from '../../assets/Sounds/RubberDuckySong-2.mp3'
import pause from '../../assets/Icon-pause.png'
import play from '../../assets/Icon-play.png'
import speaker from '../../assets/speaker.png'
import { TimelineLite } from "gsap/all";



const audioPlayerAllContainer = null;
const audioPlayerAllTween = null;
const speakerContainer = null;
const speakerTween = null;
const controlsContainer = null;
const controlsTween = null;



export default class AudioPlayer extends React.Component {

    music = new Audio(Song)
    rubberDuckyMusic = new Audio(RubberDuckySong)

    state = {
        play: false,
        volume:0.5,
        navOpen : false,
        activeSong:this.music
      }

   

      decreaseVolume=() => {
        if (this.state.activeSong.volume <= 0.9){
        this.state.activeSong.volume = this.state.activeSong.volume+0.1;
        } else {
        this.state.activeSong.volume = 1;
        }
      }
      increaseVolume=() => {
        if (this.state.activeSong.volume > 0.1){
        this.state.activeSong.volume = this.state.activeSong.volume-0.1;
        } else {
            this.state.activeSong.volume = 0;
        }
      }

    
    
      togglePlay = () => {
        this.setState({ play: !this.state.play }, () => {
          this.state.play ? this.state.activeSong.play() : this.state.activeSong.pause();
        }); 
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


        this.state.activeSong.loop = true;

        this.state.activeSong.addEventListener('ended', () => this.setState({ play: false }));
        this.state.activeSong.volume = 0.4;

        this.audioPlayerAllTween = new TimelineLite({ paused:true })
        .to(this.audioPlayerAllContainer, {duration:1.5, x: -115,ease: "power1.out" })

        this.controlsTween = new TimelineLite({ paused:true })
        .to(this.controlsContainer, {duration:1,x:0,opacity:1 })

        this.speakerTween = new TimelineLite({ paused:true })
        .to(this.speakerContainer, {duration:1.5,rotation: -180 ,opacity:1,color:"white" })

    
      }
    componentDidUpdate(prevProps,prevState){
      if (prevProps !== this.props){
        if (this.props.rubberDucky === true){
          this.setState({
              activeSong:this.rubberDuckyMusic
          })
      } else {
        this.setState({
          activeSong:this.music
      })
      }
      }
    }
      componentWillUnmount() {
        this.state.activeSong.removeEventListener('ended', () => this.setState({ play: false }));  
      }
    render(){
        return (
            <div className={this.props.rubberDucky ? 'rubberDucky__audioPlayer' : "audioPlayer "} ref={div=> this.audioPlayerAllContainer = div}>
            <button className={this.props.rubberDucky ? 'rubberDucky__speaker-container' : "audioPlayer__speaker-container "} onClick={this.state.navOpen? this.closeNav : this.openNav } >
            <img src={speaker} ref={img=> this.speakerContainer = img} alt='speaker' className="audioPlayer__speaker"></img>
            </button>
                <div className="audioPlayer__controls-container" ref={div => this.controlsContainer = div}>
                    {/* <h3 className="audioPlayer__volume">Volume : {this.state.activeSong.volume}</h3> */}
                    <button className={this.props.rubberDucky ? 'rubberDucky__play-pause' : "audioPlayer__play-pause"}
                             onClick={this.togglePlay}>
                             <img src={this.state.play ? pause : play}></img>
                             </button>
                    <button className={this.props.rubberDucky ? 'rubberDucky__increase-vol' : "audioPlayer__increase-vol"} onClick={this.increaseVolume}>-</button>
                    <button className={this.props.rubberDucky ? 'rubberDucky__decrease-vol' : "audioPlayer__decrease-vol"} onClick={this.decreaseVolume}>+</button>
                </div>
                
            </div>
        )
    }
}
    