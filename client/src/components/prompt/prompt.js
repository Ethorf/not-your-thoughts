import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import '../../styles/rubberDucky.scss';
import './prompt.scss';
import axios from 'axios';

export default class Prompt extends React.Component {
	state = {
		promptContent: 'The Milk is the Bag that you have become all along'
	};

	getPrompts = () => {
		axios
			.get('/prompts/')
			.then((response) => {
				this.setState({
					promptContent: response.data[this.randomNum(response.data.length - 1)]
				});
			})
			.catch((error) => console.log(error, 'you had errorboi getPrompts'));
	};

	randomNum = (max) => {
		return Math.floor(Math.random() * max);
	};

	componentDidMount() {
		this.getPrompts();
	}
	render() {
		return (
			<div className={`main__prompt prompt ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}>
				<h2 className={` ${this.props.rubberDucky ? 'rubberDucky__blackText' : ''}`}>
					{this.state.promptContent}
				</h2>
			</div>
		);
	}
}
