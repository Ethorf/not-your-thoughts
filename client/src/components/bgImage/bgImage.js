import React,  { Fragment, useRef, useEffect, useState } from "react";
import { TweenMax, TimelineMax,Elastic, Back} from "gsap";
import '../../pages/main/main.scss'
import bgOverlayTextureWhite from '../../assets/Background-Images/bgImg-donut1.png'

const BgImage = () => {

    const [bgAnimation, setBgAnimation] = useState();
    const [tl] = useState(new TimelineMax({ paused:true }));


  
    // let bgImgTween = useRef(null);
    let bgImgContainer = useRef(null);
    
    let bgImgTween = new TimelineMax({ paused:true })
    //     bgImgTween.to(bgImgContainer, {duration:3.3,opacity:0.48 })


    //     const bgPulse = () => {
    //         this.bgImgTween.play()
    //           setTimeout(()=>{
    //             bgImgTween.reverse()
    //           },1800)
    //       }
      
    useEffect(()=>{
        setBgAnimation(
            new TweenMax.to(bgImgContainer, {duration:3.3,opacity:0.48 }
            ).pause()
          );

        bgAnimation.play()
        setTimeout(()=>{
            bgAnimation.reverse()
        },1800)
    })

    
    return(
        <Fragment>
            <img alt="" ref={img => {bgImgContainer = img}}  className='main__bg-img' src={bgOverlayTextureWhite}></img>
        </Fragment>
    )
   
}

export default BgImage