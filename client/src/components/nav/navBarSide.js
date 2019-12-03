import React from 'react';
import { NavLink} from 'react-router-dom';
import './navBarSide.scss'
import arrow from '../../assets/down-arrow-grey-weird.png'

import { TimelineLite, CSSPlugin } from "gsap/all";


const navBarContainer = null;
const navBarTween = null;
const linksContainer = null;
const linksTween = null;
const arrowContainer = null;
const arrowTween = null;

export default class NavBarSide extends React.Component {

    state = {
        navOpen : false
    }
    openNav = () =>{
        this.navBarTween.play()
        this.linksTween.play()
        this.arrowTween.play()

        this.setState({
            navOpen:true
        })
    }

    closeNav = () =>{
        this.navBarTween.reverse()
        this.linksTween.reverse()
        this.arrowTween.reverse()


        this.setState({
            navOpen:false
        })
    }
    componentDidMount(){
        this.navBarTween = new TimelineLite({ paused:true })
        .to(this.navBarContainer, {duration:0.4, x: 45,ease: "power1.out" })

        this.linksTween = new TimelineLite({ paused:true })
        .to(this.linksContainer, {duration:1,x:0,opacity:1 })

        this.arrowTween = new TimelineLite({ paused:true })
        .to(this.arrowContainer, {duration:1,rotation: -180 ,opacity:1,color:"white" })
    }
    render() {
        return (
            <>
            <header ref={header => this.navBarContainer = header} className="nav">
            <button className="nav__arrow-container" onClick={this.state.navOpen? this.closeNav : this.openNav }>
                    <img ref={img => this.arrowContainer = img} className="nav__arrow" src={arrow} alt="hamburger"></img>
                 </button>
                <div className="nav__links-container" ref={div => this.linksContainer = div}>
                    <NavLink exact to="/main" activeClassName="nav__active" className="nav__main-link">Main</NavLink>
                    <NavLink exact to="/profile" activeClassName="nav__active" className="nav__profile-link">Profile</NavLink>
                    <NavLink exact to="/resources" activeClassName="nav__active" className="nav__resources-link">Resources</NavLink>
                </div>
               
            </header>
          </>
        )
    }
}
