import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import '../../pages/main/main.scss';
import pillarTopOutline from '../../assets/Pillars/NewPillarTop-2.png';
import crawBoxTop from '../../assets/Pillars/NuCrawBoxAnim-2-top.gif';

const PillarTop = ({ wordCount, goal }) => {
	let calc = wordCount / ((goal / 4) * 0.01);

	const pillarTopStyleWidth = () => {
		const testStyle = {
			width: `${-100 + calc - 1}%`,
			opacity: `${wordCount / 200}`
		};
		const start = { width: `0%` };
		const limit = { width: `98%` };
		if (wordCount <= goal / 4) {
			return start;
		} else if (wordCount >= goal / 4 && wordCount <= goal / 2) {
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

			<img className="main__pillar-top-outline" src={pillarTopOutline} alt="pillar Shadow thing"></img>
			<img className="main__pillar-top" src={crawBoxTop} style={pillarTopStyleWidth()}></img>
		</div>
	);
};
//I think PropTypes is just a TDD thing, so that we can check for consistency in our structures?
PillarTop.propTypes = {};
const mapStateToProps = (state) => ({
	wordCount: state.wordCount.wordCount,
	goal: state.wordCount.goal
});

export default connect(mapStateToProps, null)(PillarTop);
