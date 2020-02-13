import React from 'react';
import './entry.scss';
import Arrow from '../../assets/single-arrow2.png';
export default class Entry extends React.Component {
	state = {
		open: false
	};
	toggleEntry = () => {
		if (this.state.open === false) {
			this.setState({
				open: true
			});
		} else {
			this.setState({
				open: false
			});
		}
	};

	render(props) {
		return (
			<>
				<div className="entry__entry-all-container"></div>
				<div className="entry__entry-date-wordcount-container">
					<h3 className="entry__entry-date-wordcount">{this.props.date}</h3>
					<h3 className="entry__entry-date-wordcount">Words:{this.props.wordCount}</h3>
					<button
						className={`entry__button ${this.state.open ? 'entry__button-open' : 'entry__button-closed'}`}
						onClick={this.toggleEntry}
					>
						<img className="entry__entry-arrow" src={Arrow} alt="expand entry arrow" />
					</button>
				</div>
				<h4 className={`entry__entry-content ${this.state.open ? 'entry__entry-open' : 'entry__entry-closed'}`}>
					{this.props.content}
				</h4>
			</>
		);
	}
}
