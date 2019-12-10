import React, { Component } from "react";


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
	
    render() {
        return (
            <>
			<div className="modal">
				<h2 className="modal__congratulations">CONGRATULATIONS {this.props.firstName}!</h2>
				<h2>You've reached your goal for today</h2>
				<h3>You have completed {this.props.conDays} days in a row, and {this.props.totDays} days total</h3>
				<h4>Keep it up!</h4>
				<button onClick={this.props.close} className="modal__close-button">Close</button>
			</div>
            </>
        )
    }
}

export default SuccessModal;
