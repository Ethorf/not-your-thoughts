import React,  { Fragment, useRef, useEffect, useState } from "react";
import {TimelineMax} from "gsap";
import '../../pages/main/main.scss'
import bgOverlayTextureWhite from '../../assets/Background-Images/bgImg-donut1.png'

const BgImage = () => {
    let bgImgContainer = useRef(null);
    const [bgAnimation, setBgAnimation] = useState(null);
    const tl = new TimelineMax({repeat:-1})

    const bgAnim = () =>{
        setBgAnimation(
            tl.fromTo(bgImgContainer,{duration:10,opacity:0.02 },{duration:10,opacity:0.1}
           ).to(bgImgContainer,{duration:10,opacity:0.01})
           .play()
         );
    }
    useEffect(()=>{
        bgAnim()

        
    },[])

    
    return(
        <Fragment>
            <img alt="" ref={img => {bgImgContainer = img}}  className='main__bg-img' src={bgOverlayTextureWhite}></img>
        </Fragment>
    )
   
}

export default BgImage