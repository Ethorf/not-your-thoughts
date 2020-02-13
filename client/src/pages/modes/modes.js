import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './modes.scss';

const Modes = ({ auth: { user } }) => {
	return (
		<div className="modes">
			<h2 className="modes__achievements-unlocked">Modes / Achievements Unlocked</h2>
			<div className="modes__achievement-container">
				<div className="modes__achievement-mode-container">
					<h2 className="modes__rubber-ducky-requirement">3 Consecutive Days---> </h2>
					<h2
						className={`modes__rubber-ducky-title ${
							user && user.consecutiveDays >= 3 ? ' ' : 'strikethrough'
						}`}
					>
						Rubber Ducky Mode
					</h2>
					{/* <button
						className={`modes__rubber-ducky-activate-button
                                                 ${user && user.consecutiveDays >= 3 ? ' ' : 'rubberDucky__hidden'}`}
					>
						{/* {`${this.props.rubberDucky ? "Deactivate" : "Activate"}`} */}
					{/*</button> */}
				</div>
				<div className="modes__achievement-mode-container">
					<h2 className="modes__rubber-ducky-requirement">5 Consecutive Days---> </h2>
					<h2 className="modes__bullshittify-title"> Bullsh*tiffy Mode</h2>
				</div>
				<div className="modes__achievement-mode-container">
					<h2 className="modes__rubber-ducky-requirement">7 Consecutive Days---> </h2>
					<h2 className="modes__rpg-title"> RPG Mode</h2>
				</div>
			</div>
		</div>
	);
};

Modes.propTypes = {
	auth: PropTypes.object.isRequired,
	logout: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(Modes);
