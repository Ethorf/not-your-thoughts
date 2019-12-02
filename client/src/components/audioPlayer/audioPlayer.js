import React from 'react';
import './audioPlayer.scss'
import Song from '../../assets/Sounds/Not-Your-Thoughts-Ambient-Track-1.mp3'
import UIfx from 'uifx'
import keyPressFile1 from '../../assets/Sounds/Not-Your-Thoughts-Keyboard-SFX-1.mp3'


const keyPress = new UIfx(keyPressFile1,{
    volume: 0.5, // value must be between 0.0 ⇔ 1.0
    throttleMs: 50
  });


export default class AudioPlayer extends React.Component {


    state = {
        play: false
      }
      music = new Audio(Song)

      componentDidMount() {
        this.music.addEventListener('ended', () => this.setState({ play: false }));
        this.music.volume = 0.5;
      }
    
      componentWillUnmount() {
        this.music.removeEventListener('ended', () => this.setState({ play: false }));  
      }
    
      togglePlay = () => {
        this.setState({ play: !this.state.play }, () => {
          this.state.play ? this.music.play() : this.music.pause();
        }); 
        console.log(this.music.volume)
      }
    render(){
        // console.log(keyPress)
        return (
            <div className="audioPlayer">
            <h1>AUDIOOOO</h1>
            <button onClick={this.togglePlay}>{this.state.play ? 'Pause' : 'Play'}</button>
            <button onClick={keyPress.play}>Signup</button>

            </div>
        )
    }
}
    