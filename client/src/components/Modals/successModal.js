import React, { Component, Fragment,useRef,useState,useEffect } from "react";
import {connect } from 'react-redux'
import PropTypes from 'prop-types';
import {TimelineMax} from "gsap";
import '../../pages/main/main.scss'
import './successModal.scss'
//Redux Actions
import { openSuccessModal, closeSuccessModal} from "../../redux/actions/modalActions.js"
import { saveEntry } from "../../redux/actions/entryActions"
import {goalReached} from '../../redux/actions/index'
import entriesReducer from "../../redux/reducers/entriesReducer";


const SuccessModal =({auth:{ user },entry, modals, openSuccessModal, closeSuccessModal, saveEntry,wordCount, goalReached, goalReachedStatus})=> {
    let modalOverlayContainer = useRef(null);
    let modalContentContainer = useRef(null);
    const [overlayAnimation, setOverlayAnimation] = useState(null);
    const [contentAnimation, setContentAnimation] = useState(null);

    const overlayTl = new TimelineMax({paused:true})
    const contentTl = new TimelineMax({paused:true})

    const openModalOverlayAnimation = () =>{
        setOverlayAnimation(
            overlayTl.to(modalOverlayContainer, {duration:1,opacity:1 }).play()
        )
    }

    const openModalContentAnimation = () => {
              setContentAnimation(
            contentTl.to(modalContentContainer, {duration:1,y:100,opacity:1 }).play()
        )
    }

    const closeModalOverlayAnimation = () =>{
        setOverlayAnimation(
            overlayTl.to(modalOverlayContainer, {duration:1,opacity:1 }).reverse()
        )
    }

    const closeModalContentAnimation = () => {
              setContentAnimation(
            contentTl.to(modalContentContainer, {duration:1,y:100,opacity:1 }).reverse()
        )
    }

    const openModalAll=()=>{
        openModalContentAnimation()
        openModalOverlayAnimation()
        openSuccessModal()
    }

    const closeModalAll=()=>{
        closeModalContentAnimation()
        closeModalOverlayAnimation()
        closeSuccessModal()
        goalReached()

    }

    const closeSaveModalAll=()=>{
        closeModalContentAnimation()
        closeModalOverlayAnimation()
        closeSuccessModal()
        goalReached()
        saveEntry({entry:entry})
    }
    useEffect(()=>{
        if (wordCount >= 400 && goalReachedStatus === false ){
            openModalAll()
        }

    },[wordCount])
        return (
            <Fragment >
                {/* <button onClick={openModalAll}>Flundi</button> */}
                <div className={`${modals.successModalOpen ? "main__modal2OverlayOpen" : "main__modal2OverlayClosed"  }`} ref={div => modalOverlayContainer = div}></div>
                <div className={`${modals.successModalOpen ? "main__modal2" : "main__modal2Closed" }`} ref={div => modalContentContainer = div} >
                    <h2 className="modal__congratulations">CONGRATULATIONS {user.name.toUpperCase().split(' ')[0]}!</h2>
                    <div className="modal__mainText">
                        <h2 className="modal__goal">You've reached your goal for today</h2>
                        <h3 className="modal__goal"> You have completed {user.consecutiveDays} days in a row, and {user.totalDays} days total</h3>
                        <h4 className="modal__goal">Keep it up!</h4>
                        <button onClick={closeSaveModalAll} className="modal__close-button">Save and Close</button> 
                        <button onClick={closeModalAll} className="modal__close-button"> Just Close</button>
                    </div>
                </div>
            </Fragment>
       
        )
}

SuccessModal.propTypes = {
    auth: PropTypes.object.isRequired,
  };
  
  const mapStateToProps = state => ({
    auth: state.auth,
    modals:state.modals,
    wordCount: state.wordCount.wordCount,
    entry:state.entries.entry,
    goalReachedStatus:state.wordCount.goalReachedStatus
  
  });
  
  export default connect(
    mapStateToProps,
    { openSuccessModal,closeSuccessModal,saveEntry,goalReached }
  )(SuccessModal);
