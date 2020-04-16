import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import '../../pages/main/main.scss';
import pillarTopOutline from '../../assets/Pillars/NewPillarTop-2.png';
import PillarTopOutlineInverted from '../../assets/Pillars/NewPillarTop-4-inverted.png';

import crawBoxTop from '../../assets/Animations/SpikyCrawBox-Top-1.gif';
import crawBoxTopInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Top.gif';

const PillarTop = ({ wordCount, goal, mode, auth: { user } }) => {
	let calc = wordCount / ((user.dailyWordsGoal / 4) * 0.01);

	const pillarTopStyleWidth = () => {
		const testStyle = {
			width: `${-103 + calc - 1}%`
			// opacity: `${wordCount / 200}`
		};
		const start = { width: `0%` };
		const limit = { width: `98%` };
		if (wordCount <= user.dailyWordsGoal / 4) {
			return start;
		} else if (wordCount >= user.dailyWordsGoal / 4 && wordCount <= user.dailyWordsGoal / 2) {
			return testStyle;
		} else {
			return limit;
		}
	};
	return (
		<div className="main__pillar-top-container">
			{/* <img src={WaterfallUp} className= 
            {props.rubberDucky ? 'rubberDucky__waterFall-top' : 'rubberDucky__hidden'} alt=""></img>
            <img src={WaterfallUp} className= 
            {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
              <img src={WaterfallUp} className= 
            {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
              <img src={WaterfallUp} className= 
            {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'}alt=""></img>
                <img src={WaterfallUp} className= {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'} alt=""></img>
                <img src={WaterfallUp} className= {props.rubberDucky ? 'rubberDucky__waterFall-top2' : 'rubberDucky__hidden'} alt=""></img>
          <img className={`main__pillar-top-outline 
            ${props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`}
             src={pillarTop} alt='pillar Shadow thing'></img>
          <img ref={img=> pillarContainer = img}
           src={crawBoxTop} 
           className={`main__pillar-top ${props.rubberDucky ? 'rubberDucky__hidden' : ''}`}
           style={pillarTopStyleWidth()} alt=""></img>   */}

			<img
				className="main__pillar-top-outline"
				src={mode === '-light' ? PillarTopOutlineInverted : pillarTopOutline}
				alt="pillar Shadow thing"
			></img>
			<img
				className="main__pillar-top"
				src={mode === '-light' ? crawBoxTopInverted : crawBoxTop}
				style={pillarTopStyleWidth()}
			></img>
		</div>
	);
};

const mapStateToProps = (state) => ({
	wordCount: state.wordCount.wordCount,
	auth: state.auth,
	mode: state.modes.mode
});

export default connect(mapStateToProps, null)(PillarTop);
