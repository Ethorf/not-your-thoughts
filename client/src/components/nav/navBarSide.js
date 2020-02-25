import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/rubberDucky.scss';
import { connect } from 'react-redux';
import { logout } from '../../redux/actions/authActions';

import './navBarSide.scss';
import arrow from '../../assets/down-arrow-grey-weird.png';

import { TimelineLite } from 'gsap/all';

const navBarContainer = null;
const navBarTween = null;
const linksContainer = null;
const linksTween = null;
const arrowContainer = null;
const arrowTween = null;

class NavBarSide extends React.Component {
	state = {
		navOpen: false
	};
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
			x: 45,
			ease: 'power1.out'
		});

		this.linksTween = new TimelineLite({ paused: true }).to(this.linksContainer, { duration: 1, x: 0, opacity: 1 });

		this.arrowTween = new TimelineLite({ paused: true }).to(this.arrowContainer, {
			duration: 1,
			rotation: -180,
			opacity: 1,
			color: 'white'
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
							className={this.props.rubberDucky ? 'rubberDucky__nav-arrow' : 'nav__arrow '}
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
						<button className={`nav__logout-button${this.props.mode}`} onClick={this.props.logout}>
							Logout
						</button>
					</div>
				</div>
			</>
		);
	}
}
const mapStateToProps = (state) => ({
	mode: state.modes.mode
});
export default connect(mapStateToProps, { logout })(NavBarSide);
