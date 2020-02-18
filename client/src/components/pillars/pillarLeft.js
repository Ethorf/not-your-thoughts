import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import '../../pages/main/main.scss';
import PillarLeftOutline from '../../assets/Pillars/PillarLeft-5-shadowboi.png';
import crawBoxLeft from '../../assets/Pillars/nuCrawBoxAnim-1.gif';
//is using multiple dynamic variables a weird thing? must a man do this or maybe not do this?
//FUUUCK
//
const PillarLeft = ({ wordCount, goal }) => {
	const pillarLeftStyleHeight = () => {
		let threend = goal / 0.01;
		const testStyle = {
			height: `${wordCount + goal * 0.01}%`,
			opacity: `${wordCount / (goal / 10)}`
		};

		const limit = {
			height: `100%`
		};
		if (wordCount <= goal / 4) {
			return testStyle;
			console.log(testStyle);
		} else {
			return limit;
		}
		console.log(testStyle);
	};
	// console.log(PillarLeft());
	return (
		<div className="main__pillar-left-container">
			{/* <img alt="" src={startLine} className= 
                {this.props.rubberDucky ? 'rubberDucky__startLine' : 'rubberDucky__hidden'}></img>
                <div className={`main__pillar-left-container 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-left-container' : ''}`}>

                  <img src={WaterfallUp} className= 
                  {this.props.rubberDucky ? 'rubberDucky__waterFall-left' : 'rubberDucky__hidden'} alt="rubberducky waterfall"></img>

                  <img className={`main__pillar-left-outline 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={this.props.rubberDucky ? WaterfallUp : nuPillarLeft} alt='pillar Shadow thing'></img>

                  <img ref={img=> this.pillarContainer = img} src={crawBox} className={`main__pillar-left ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarLeftStyleHeight()} alt="left pillar"></img>                
                </div> */}

			<img className="main__pillar-left-outline" src={PillarLeftOutline} alt="pillar Shadow thing"></img>
			<img className="main__pillar-left" src={crawBoxLeft} style={pillarLeftStyleHeight()}></img>
		</div>
	);
};

PillarLeft.propTypes = {};
const mapStateToProps = (state) => ({
	wordCount: state.wordCount.wordCount,
	goal: state.wordCount.goal
});

export default connect(mapStateToProps, null)(PillarLeft);
