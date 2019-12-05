import React, { Component } from "react";
import { TimelineLite, CSSPlugin } from "gsap/all";

class SuccessModal extends React.Component {
 

    changeHandler = (event) => {
        if (event.target.value !== '') {
            this.setState({
                [event.target.name]: event.target.value
            })
        }
    }

    submitHandler = (event) => {
        event.preventDefault();

	}
	

	// this.modalTween = new TimelineLite({ paused:true })
	// .to(this.modalContainer, {duration:1.5,opacity:1 })

    render() {
        return (
            <>
			<div className="modal">
				<h2>Congratulations {this.props.firstName}!</h2>
				<h2>You've reached your goal for today</h2>
				<h3>You have completed {this.props.conDays} days in a row, and {this.props.totDays} days total</h3>

			</div>
            </>
        )
    }
}

export default SuccessModal;
