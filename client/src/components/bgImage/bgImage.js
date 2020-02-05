import React,  { Fragment, useRef, useEffect, useState } from "react";
import { TweenMax, TimelineLite,Elastic, Back} from "gsap";
import '../../pages/main/main.scss'
import bgOverlayTextureWhite from '../../assets/Background-Images/bgImg-donut1.png'

const BgImage = () => {

    // const [bgImgAnimation, setBgImgAnimation] = useState();
  
    // const bgPulse = () => {
    //   this.bgImgTween.play()
    //     setTimeout(()=>{
    //       this.bgImgTween.reverse()
    //     },1800)
    // }
  
    // // let bgImgTween = useRef(null);
  
    // let bgImgTween = new TimelineLite({ paused:true })
    //     .to(bgImgContainer, {duration:3.3,opacity:0.48 })
  
    let bgImgContainer = useRef(null);
    
    return(
        <Fragment>
            <img alt="" ref={img => {bgImgContainer = img}}  className='main__bg-img' src={bgOverlayTextureWhite}></img>
        </Fragment>
    )
   
}

export default BgImage