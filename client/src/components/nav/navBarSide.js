import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../../redux/actions/authActions';
import { TimelineLite } from 'gsap/all';
import '../../styles/rubberDucky.scss';
import './navBarSide.scss';
import arrow from '../../assets/Icons/down-arrow-black-2.png';

class NavBarSide extends React.Component {
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
		this.navBarTween.play();
		this.linksTween.play();
		this.arrowTween.play();

		this.setState({
			navOpen: true
		});
	};

	closeNav = () => {
		this.navBarTween.reverse();
		this.linksTween.reverse();
		this.arrowTween.reverse();
		this.setState({
			navOpen: false
		});
	};
	componentDidMount() {
		this.navBarTween = new TimelineLite({ paused: true }).to(this.navBarContainer, {
			duration: 0.4,
			x: 45
			// ease: 'power1.out'
		});

		this.linksTween = new TimelineLite({ paused: true }).to(this.linksContainer, { duration: 1, x: 0, opacity: 1 });
		this.arrowTween = new TimelineLite({ paused: true }).to(this.arrowContainer, {
			duration: 1
			// rotation: -180
		});
	}
	render(logout) {
		return (
			<>
				<div ref={(header) => (this.navBarContainer = header)} className="nav">
					<button
						className={
							this.props.mode === '-.light' ? 'rubberDucky__nav-arrow-container' : 'nav__arrow-container '
						}
						onClick={this.state.navOpen ? this.closeNav : this.openNav}
					>
						<img
							ref={(img) => (this.arrowContainer = img)}
							className={`nav__arrow  ${this.state.navOpen ? 'nav__arrow-rotate' : ''}`}
							src={arrow}
							alt="hamburger"
						></img>
					</button>
					<div
						className={`nav__links-container${this.props.mode} `}
						ref={(div) => (this.linksContainer = div)}
					>
						<NavLink
							exact
							to="/main"
							activeClassName="nav__active"
							className={`nav__link${this.props.mode}`}
						>
							Main
						</NavLink>
						<NavLink
							exact
							to="/profile"
							activeClassName="nav__active"
							className={`nav__link${this.props.mode}`}
						>
							Profile
						</NavLink>
						<NavLink
							exact
							to="/resources"
							activeClassName="nav__active"
							className={`nav__link${this.props.mode}`}
						>
							Resources
						</NavLink>
						<NavLink
							exact
							to="/modes"
							activeClassName="nav__active"
							className={`nav__link${this.props.mode}`}
						>
							Modes
						</NavLink>
						<NavLink
							exact
							to="/about"
							activeClassName="nav__active"
							className={`nav__link${this.props.mode}`}
						>
							About
						</NavLink>
						{this.props.isAuthenticated ? (
							<button className={`nav__logout-button${this.props.mode}`} onClick={this.props.logout}>
								Logout
							</button>
						) : (
							<NavLink
								exact
								to="/login"
								activeClassName="nav__active"
								className={`nav__link${this.props.mode}`}
							>
								Login
							</NavLink>
						)}
					</div>
				</div>
			</>
		);
	}
}
const mapStateToProps = (state) => ({
	mode: state.modes.mode,
	isAuthenticated: state.auth.isAuthenticated
});
export default connect(mapStateToProps, { logout })(NavBarSide);
