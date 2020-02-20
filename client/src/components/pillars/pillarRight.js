import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import '../../pages/main/main.scss';
import PillarRightOutline from '../../assets/Pillars/NewPillarLeft-2.png';
import crawBoxRight from '../../assets/Pillars/NuCrawBoxAnim-2-right.gif';

const PillarRight = ({ wordCount, goal }) => {
	let calc = wordCount / ((goal / 4) * 0.01);

	const pillarRightStyleHeight = () => {
		const testStyle = {
			//This -197 was -200 originally
			height: `${-197 + calc + 1}%`
		};
		const start = { height: `0%` };
		const limit = { height: `100%` };
		if (wordCount <= goal / 2) {
			return start;
		} else if (wordCount >= goal / 2 && wordCount <= goal * 0.75) {
			return testStyle;
		} else {
			return limit;
		}
	};
	return (
		<div className="main__pillar-right-container">
			{/* <div className={`main__pillar-right-container 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-right-container' : ''}`}>
                  <img alt="" src={WaterfallUp} className= {this.props.rubberDucky ? 'rubberDucky__waterFall-right' :
                  'rubberDucky__hidden'}></img>
                    <img className={`main__pillar-right-outline 
                  ${this.props.rubberDucky ? 'rubberDucky__pillar-hidden' : ''}`} src={nuPillarLeft} alt='pillar Shadow thing'></img>
                  < img ref={img=> this.pillarContainer = img} src={crawBoxRight} className={`main__pillar-right ${this.props.rubberDucky ? 'rubberDucky__hidden' : ''}`} style={this.pillarRightStyleHeight()} alt="right pillar"></img>                

                </div>
              </div> */}

			<img className="main__pillar-right-outline" src={PillarRightOutline} alt="pillar Shadow thing"></img>
			<img className="main__pillar-right" src={crawBoxRight} style={pillarRightStyleHeight()}></img>
		</div>
	);
};

PillarRight.propTypes = {};

const mapStateToProps = (state) => ({
	wordCount: state.wordCount.wordCount,
	goal: state.wordCount.goal
});

export default connect(mapStateToProps, null)(PillarRight);
