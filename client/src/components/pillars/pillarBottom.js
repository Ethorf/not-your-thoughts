import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import '../../pages/main/main.scss';
import pillarTopOutline from '../../assets/Pillars/NewPillarTop-2.png';
import crawBoxBottom from '../../assets/Pillars/NuCrawBoxAnim-2-bottom.gif';
import crawBoxBottomInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Bottom.gif';

import PillarTopOutlineInverted from '../../assets/Pillars/NewPillarTop-3-inverted.png';

const PillarBottom = ({ wordCount, goal, mode }) => {
	let calc = wordCount / ((goal / 4) * 0.01);

	const pillarBottomStyleWidth = () => {
		const testStyle = {
			width: `${-300 + calc}%`,
			left: `${99 - (-300 + calc)}%`
		};
		const start = {
			width: `0%`,
			left: '99%'
		};
		const limit = {
			width: `97%`,
			left: '0%'
		};
		if (wordCount <= goal * 0.75) {
			return start;
		} else if (wordCount >= goal * 0.75 && wordCount <= goal) {
			return testStyle;
		} else {
			return limit;
		}
	};
	return (
		<div className="main__pillar-bottom-container">
			{/* <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={WaterfallUp} className= 
                {this.props.rubberDucky ? 'rubberDucky__waterFall-bottom2' : 'rubberDucky__hidden'}></img>
              <img alt="" src={finishLine} className= 
                {this.props.rubberDucky ? 'rubberDucky__finishLine' : 'rubberDucky__hidden'}></img>
                
                <img className={`main__pillar-bottom-outline 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={pillarTop} alt='pillar Shadow thing'></img>
                  <img ref={img=> this.pillarContainer = img} src={crawBoxBottom} className={`main__pillar-bottom ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarBottomStyleWidth()} alt="william"></img>                */}

			<img
				className="main__pillar-bottom-outline"
				src={mode === '-light' ? PillarTopOutlineInverted : pillarTopOutline}
				alt="pillar Shadow thing"
			></img>
			<img
				className="main__pillar-bottom"
				src={mode === '-light' ? crawBoxBottomInverted : crawBoxBottom}
				style={pillarBottomStyleWidth()}
			></img>
		</div>
	);
};

PillarBottom.propTypes = {};
const mapStateToProps = (state) => ({
	wordCount: state.wordCount.wordCount,
	goal: state.wordCount.goal,
	mode: state.modes.mode
});

export default connect(mapStateToProps, null)(PillarBottom);
