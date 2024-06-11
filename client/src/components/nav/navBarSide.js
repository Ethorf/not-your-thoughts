import React from 'react'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { TimelineLite } from 'gsap/all'
import '../../styles/rubberDucky.scss'
import './navBarSide.scss'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

import { resetCurrentEntryState } from '@redux/reducers/currentEntryReducer'
import { logout } from '@redux/actions/authActions'

class NavBarSide extends React.Component {
  state = {
    navOpen: false,
  }
  navBarContainer = null
  navBarTween = null
  linksContainer = null
  linksTween = null
  arrowContainer = null
  arrowTween = null
  openNav = () => {
    this.navBarTween.play()
    this.linksTween.play()
    this.arrowTween.play()

    this.setState({
      navOpen: true,
    })
  }

  closeNav = () => {
    this.navBarTween.reverse()
    this.linksTween.reverse()
    this.arrowTween.reverse()
    this.setState({
      navOpen: false,
    })
  }
  componentDidMount() {
    this.navBarTween = new TimelineLite({ paused: true }).to(this.navBarContainer, {
      duration: 0.4,
      x: 45,
    })

    this.linksTween = new TimelineLite({ paused: true }).to(this.linksContainer, { duration: 1, x: 0, opacity: 1 })
    this.arrowTween = new TimelineLite({ paused: true }).to(this.arrowContainer, {
      duration: 1,
    })
  }
  render() {
    return (
      <div ref={(header) => (this.navBarContainer = header)} className="nav">
        <button
          className={this.props.mode === '-.light' ? 'rubberDucky__nav-arrow-container' : 'nav__arrow-container '}
          onClick={this.state.navOpen ? this.closeNav : this.openNav}
        >
          <img
            ref={(img) => (this.arrowContainer = img)}
            className={`nav__arrow  ${this.state.navOpen ? 'nav__arrow-rotate' : ''}`}
            src={arrow}
            alt="hamburger"
          />
        </button>
        <div className={`nav__links-container${this.props.mode} `} ref={(div) => (this.linksContainer = div)}>
          <NavLink exact to="/dashboard" activeClassName="nav__active" className={`nav__link${this.props.mode}`}>
            Dashboard
          </NavLink>
          <NavLink
            exact
            onClick={this.props.resetCurrentEntryState}
            to="/create-journal-entry"
            activeClassName="nav__active"
            className={`nav__link${this.props.mode}`}
          >
            New Journal
          </NavLink>
          <NavLink
            exact
            onClick={this.props.resetCurrentEntryState}
            to="/create-node-entry"
            activeClassName="nav__active"
            className={`nav__link${this.props.mode}`}
          >
            New Node
          </NavLink>
          {!this.props.guestMode ? (
            <>
              <NavLink exact to="/profile" activeClassName="nav__active" className={`nav__link${this.props.mode}`}>
                Profile
              </NavLink>
              <NavLink exact to="/entries" activeClassName="nav__active" className={`nav__link${this.props.mode}`}>
                Entries
              </NavLink>
            </>
          ) : null}
          <NavLink exact to="/resources" activeClassName="nav__active" className={`nav__link${this.props.mode}`}>
            Resources
          </NavLink>
          {!this.props.guestMode ? (
            <NavLink exact to="/modes" activeClassName="nav__active" className={`nav__link${this.props.mode}`}>
              Modes
            </NavLink>
          ) : null}

          <NavLink exact to="/about" activeClassName="nav__active" className={`nav__link${this.props.mode}`}>
            About
          </NavLink>
          {this.props.isAuthenticated ? (
            <button className={`nav__logout-button${this.props.mode}`} onClick={this.props.logout}>
              Logout
            </button>
          ) : (
            <NavLink exact to="/login" activeClassName="nav__active" className={`nav__link${this.props.mode}`}>
              Login
            </NavLink>
          )}
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => ({
  mode: state.modes.mode,
  guestMode: state.auth.guestMode,
  isAuthenticated: state.auth.isAuthenticated,
})
export default connect(mapStateToProps, { logout, resetCurrentEntryState })(NavBarSide)
