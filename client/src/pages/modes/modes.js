import React, { Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './modes.scss';
import { changeMode } from '../../redux/actions/modeActions';

const Modes = ({ auth: { user }, changeMode, mode, isAuthenticated }) => {
	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}
	const changeModeLight = () => {
		changeMode('-light');
	};
	const changeModeDefault = () => {
		changeMode('');
	};
	const Buttons = () => {
		return (
			<Fragment>
				{mode === '-light' ? (
					<button onClick={changeModeDefault} className={`modes__light-mode-button`}>
						Deactivate
					</button>
				) : (
					<button onClick={changeModeLight} className={`modes__light-mode-button`}>
						Activate
					</button>
				)}
			</Fragment>
		);
	};
	return (
		<>
			<div className={`modes__bg ${mode}`} />

			<div className={`modes ${mode}`}>
				<header className={`modes__header ${mode}`}>Modes / Achievements Unlocked</header>
				<div className="modes__achievement-container">
					<div className="modes__achievement-mode-container">
						<h2 className="modes__mode-requirement">4 Consecutive Days </h2>
						<h2
							className={`modes__mode-title ${
								user && user.consecutiveDays >= 4 ? ' ' : 'strikethrough'
							} ${mode}`}
						>
							Light Mode
						</h2>
						{user && user.consecutiveDays >= 4 ? <Buttons /> : ''}
					</div>
					<div className="modes__achievement-mode-container">
						<h2 className="modes__mode-requirement">6 Consecutive Days </h2>
						<h2
							className={`modes__rubber-ducky-title modes__mode-title ${
								user && user.consecutiveDays >= 6 ? ' ' : 'strikethrough'
							}`}
						>
							Rubber Ducky Mode
						</h2>
						<span className={`modes__coming-soon ${mode}`}> **Coming Soon!</span>
						{/* <button
						className={`modes__rubber-ducky-activate-button
                                                 ${user && user.consecutiveDays >= 3 ? ' ' : 'rubberDucky__hidden'}`}
					>
						{/* {`${this.props.rubberDucky ? "Deactivate" : "Activate"}`} */}
						{/*</button> */}
					</div>
					<div className="modes__achievement-mode-container">
						<h2 className="modes__mode-requirement">9 Consecutive Days</h2>
						<h2
							className={`modes__mode-title ${
								user && user.consecutiveDays >= 9 ? ' ' : 'strikethrough'
							} ${mode}`}
						>
							Bull sh*tiffy Mode
						</h2>
						<span className={`modes__coming-soon ${mode}`}> **Coming Soon!</span>
					</div>

					<div className="modes__achievement-mode-container">
						<h2 className="modes__mode-requirement">11 Consecutive Days </h2>
						<h2
							className={`modes__mode-title ${
								user && user.consecutiveDays >= 11 ? ' ' : 'strikethrough'
							} ${mode}`}
						>
							RPG Mode
						</h2>
						<span className={`modes__coming-soon ${mode}`}> **Coming Soon!</span>
					</div>
				</div>
			</div>
		</>
	);
};

Modes.propTypes = {
	isAuthenticated: PropTypes.bool
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
	mode: state.modes.mode,
	auth: state.auth
});

export default connect(mapStateToProps, { changeMode })(Modes);
