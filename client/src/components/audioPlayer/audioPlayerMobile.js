import React from 'react';
import { connect } from 'react-redux';
import './audioPlayerMobile.scss';
import Song from '../../assets/Sounds/Not-Your-Thoughts-Ambient-Track-1.mp3';
// import RubberDuckySong from '../../assets/Sounds/RubberDuckySong-2.mp3';
import pause from '../../assets/Icons/Icon-pause.png';
import play from '../../assets/Icons/Icon-play.png';
import pauseBlack from '../../assets/Icons/pause-icon-black.png';
import playBlack from '../../assets/Icons/play-icon-black.png';
import speaker from '../../assets/Icons/speaker.png';

class AudioPlayerMobile extends React.Component {
	music = new Audio(Song);
	// rubberDuckyMusic = new Audio(RubberDuckySong);
	state = {
		play: false,
		volume: 0.3,
		navOpen: false,
		activeSong: this.music
	};

	decreaseVolume = () => {
		if (this.state.activeSong.volume <= 0.9) {
			this.state.activeSong.volume = this.state.activeSong.volume + 0.1;
		} else {
			this.state.activeSong.volume = 1;
		}
	};
	increaseVolume = () => {
		if (this.state.activeSong.volume > 0.1) {
			this.state.activeSong.volume = this.state.activeSong.volume - 0.1;
		} else {
			this.state.activeSong.volume = 0;
		}
	};

	togglePlay = () => {
		this.setState({ play: !this.state.play }, () => {
			this.state.play ? this.state.activeSong.play() : this.state.activeSong.pause();
		});
	};

	componentDidMount() {
		this.state.activeSong.loop = true;

		this.state.activeSong.addEventListener('ended', () => this.setState({ play: false }));
	}
	componentDidUpdate(prevProps) {
		if (prevProps !== this.props) {
			if (this.props.rubberDucky === true) {
				this.setState({
					activeSong: this.rubberDuckyMusic
				});
			} else {
				this.setState({
					activeSong: this.music
				});
			}
		}
	}
	componentWillUnmount() {
		this.state.activeSong.removeEventListener('ended', () => this.setState({ play: false }));
	}

	render() {
		return (
			<>
				<img src={speaker} alt="speaker" className="audioPlayer__speaker"></img>
				<div className={`audioPlayer__controls-container`}>
					<button className={`audioPlayer__play-pause`} onClick={this.togglePlay}>
						{this.props.mode === '-light' ? (
							<img
								className={`audioPlayer__play-pause-img-light`}
								src={this.state.play ? pauseBlack : playBlack}
								alt="play/pause icon"
							></img>
						) : (
							<img
								className={`audioPlayer__play-pause-img`}
								src={this.state.play ? pause : play}
								alt="play/pause icon"
							></img>
						)}
					</button>
					<button className={`audioPlayer__vol${this.props.mode}`} onClick={this.increaseVolume}>
						-
					</button>
					<button className={`audioPlayer__vol${this.props.mode}`} onClick={this.decreaseVolume}>
						+
					</button>
				</div>
			</>
		);
	}
}

const mapStateToProps = (state) => ({
	mode: state.modes.mode
});

export default connect(mapStateToProps)(AudioPlayerMobile);
