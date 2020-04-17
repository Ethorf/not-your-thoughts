import React from 'react';
import { connect } from 'react-redux';
import './entry.scss';
import Arrow from '../../assets/Icons/single-arrow-3.png';

class Entry extends React.Component {
	state = {
		open: false,
		deleteModalOpen: false
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
	openDeleteModal = () => {
		this.setState({
			deleteModalOpen: true
		});
	};

	closeDeleteModal = () => {
		this.setState({
			deleteModalOpen: false
		});
	};

	render() {
		return (
			<>
				<div className="entry__entry-date-wordcount-container">
					<h3 className="entry__entry-date-wordcount entry__date">{this.props.date}</h3>
					<div className="entry__wordcount-container">
						<h3 className="entry__entry-date-wordcount entry__words">Words: {this.props.wordCount}</h3>
					</div>
					<button
						className={`entry__button ${this.state.open ? 'entry__button-open' : 'entry__button-closed'}`}
						onClick={this.toggleEntry}
					>
						<img className="entry__entry-arrow" src={Arrow} alt="expand entry arrow" />
					</button>
					<button onClick={this.openDeleteModal} className="entry__delete-button">
						X
					</button>
				</div>
				<div className={this.state.deleteModalOpen ? 'entry__delete-modal-open' : 'entry__delete-modal-closed'}>
					<h3 className="entry__delete-modal-text">Are you sure you want to delete this entry?</h3>
					<div className="entry__delete-modal-buttons-container">
						<button
							onClick={() => {
								this.props.deleteEntry(this.props.id);
								this.closeDeleteModal();
							}}
							className="entry__delete-modal-button"
						>
							Yes
						</button>
						<button onClick={this.closeDeleteModal} className="entry__delete-modal-button">
							No
						</button>
					</div>
				</div>
				<h4
					className={`entry__entry-content ${this.props.mode} ${
						this.state.open ? 'entry__entry-open' : 'entry__entry-closed'
					}`}
				>
					{this.props.content}
				</h4>
			</>
		);
	}
}

const mapStateToProps = (state) => ({
	mode: state.modes.mode
});

export default connect(mapStateToProps)(Entry);
