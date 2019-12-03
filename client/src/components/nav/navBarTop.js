import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './navBarTop.scss'
import hamburger from '../../assets/hamburger.svg'
import { TimelineLite, CSSPlugin } from "gsap/all";


const navBarContainer = null;
const navBarTween = null;


export default class NavBarTop extends React.Component {

    state = {
        navOpen : false
    }

    openNav = () =>{
        this.navBarTween.play()
        this.setState({
            navOpen:true
        })
    }

    closeNav = () =>{
        this.navBarTween.reverse()
        this.setState({
            navOpen:false
        })
    }
    componentDidMount(){
        this.navBarTween = new TimelineLite({ paused:true })
        .to(this.navBarContainer, {duration:1, y: 30,ease: "power2.out", opacity:1 })
    }
    render() {
        return (
            <>
            <header ref={header => this.navBarContainer = header} className="nav">
                <div className="nav__links-container">
                    <NavLink exact to="/main" activeClassName="nav__active" className="nav__main-link">Main</NavLink>
                    <NavLink exact to="/profile" activeClassName="nav__active" className="nav__profile-link">Profile</NavLink>
                    <NavLink exact to="/resources" activeClassName="nav__active" className="nav__resources-link">Resources</NavLink>
                </div>
                <button className="nav__hamburger-container" onClick={this.state.navOpen? this.closeNav : this.openNav }>
                    <img className="nav__hamburger" src={hamburger} alt="hamburger"></img>
                 </button>
            </header>
          </>
        )
    }
}
