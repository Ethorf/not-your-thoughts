import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/rubberDucky.scss';
import { connect } from 'react-redux';
import { logout } from '../../redux/actions/authActions';

import './navBarTop.scss';
import arrow from '../../assets/down-arrow-grey-weird.png';
import AudioPlayerMobile from '../../components/audioPlayer/audioPlayerMobile.js';
import { TimelineLite } from 'gsap/all';

class NavBarTop extends React.Component {
	state = {
		navOpen: false
	};
	navBarContainer = null;
	navBarTween = null;
	linksContainer = null;
	linksTween = null;
	arrowContainer = null;
	arrowTween = null;
	openNav = () => {
		// this.arrowTween.play();

		this.setState({
			navOpen: true
		});
	};

	closeNav = () => {
		this.arrowTween.reverse();
		this.setState({
			navOpen: false
		});
	};
	componentDidMount() {
		this.arrowTween = new TimelineLite({ paused: true }).to(this.arrowContainer, {
			duration: 1,
			rotation: -180,
			opacity: 1,
			color: 'white'
		});
	}
	render() {
		return (
			<div
				ref={(header) => (this.navBarContainer = header)}
				className={`navTop ${this.state.navOpen ? `navTop__open` : `navTop__closed`}`}
			>
				<div className="navTop__top-container">
					<button
						className={
							this.props.mode === '-.light'
								? 'rubberDucky__navTop-arrow-container'
								: 'navTop__arrow-container '
						}
						onClick={this.state.navOpen ? this.closeNav : this.openNav}
					>
						<img
							ref={(img) => (this.arrowContainer = img)}
							className={this.state.navOpen ? 'navTop__arrow-open ' : 'navTop__arrow-closed '}
							src={arrow}
							alt="hamburger"
						></img>
					</button>
					<h2 className={`navTop__title`}>Not Your Thoughts</h2>
				</div>

				<div
					className={`${
						this.state.navOpen ? `navTop__links-container-open` : `navTop__links-container-closed`
					}${this.props.mode} `}
					ref={(div) => (this.linksContainer = div)}
				>
					<NavLink
						exact
						to="/main"
						activeClassName="navTop__active"
						className={`navTop__link${this.props.mode}`}
					>
						Main
					</NavLink>
					<NavLink
						exact
						to="/profile"
						activeClassName="navTop__active"
						className={`navTop__link${this.props.mode}`}
					>
						Profile
					</NavLink>
					<NavLink
						exact
						to="/resources"
						activeClassName="navTop__active"
						className={`navTop__link${this.props.mode}`}
					>
						Resources
					</NavLink>
					<NavLink
						exact
						to="/modes"
						activeClassName="navTop__active"
						className={`navTop__link${this.props.mode}`}
					>
						Modes
					</NavLink>
					<NavLink
						exact
						to="/about"
						activeClassName="navTop__active"
						className={`navTop__link${this.props.mode}`}
					>
						About
					</NavLink>
					{this.props.isAuthenticated ? (
						<button className={`navTop__logout-button${this.props.mode}`} onClick={this.props.logout}>
							Logout
						</button>
					) : (
						<NavLink
							exact
							to="/login"
							activeClassName="navTop__active"
							className={`navTop__link${this.props.mode}`}
						>
							Login
						</NavLink>
					)}
					<AudioPlayerMobile />
				</div>
			</div>
		);
	}
}
const mapStateToProps = (state) => ({
	mode: state.modes.mode,
	isAuthenticated: state.auth.isAuthenticated
});
export default connect(mapStateToProps, { logout })(NavBarTop);
