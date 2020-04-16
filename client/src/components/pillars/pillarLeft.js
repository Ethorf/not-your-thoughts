import React from 'react';
import { connect, useSelector } from 'react-redux';
import '../../pages/main/main.scss';
import PillarLeftOutline from '../../assets/Pillars/NewPillarLeft-2.png';
import PillarLeftOutlineInverted from '../../assets/Pillars/NewPillarLeft-2-inverted.png';

import crawBoxLeft from '../../assets/Animations/SpikyCrawBox-Left-1.gif';
import crawBoxLeftInverted from '../../assets/Pillars/CrawBoxes/NewCrawBox-Inverted-Left.gif';

const PillarLeft = ({ wordCount, mode, auth: { user } }) => {
	let calc = wordCount / ((user.dailyWordsGoal / 4) * 0.01);

	const pillarLeftStyleHeight = () => {
		const testStyle = {
			height: `${calc + 1}%`,
			opacity: `${wordCount / (user.dailyWordsGoal / 10)}`
		};

		const limit = {
			height: `100%`
		};
		if (wordCount <= user.dailyWordsGoal / 4) {
			return testStyle;
		} else {
			return limit;
		}
	};

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

			<img
				className="main__pillar-left-outline"
				src={mode === '-light' ? PillarLeftOutlineInverted : PillarLeftOutline}
				alt="pillar Shadow thing"
			></img>
			<img
				className="main__pillar-left"
				src={mode === '-light' ? crawBoxLeftInverted : crawBoxLeft}
				style={pillarLeftStyleHeight()}
			></img>
		</div>
	);
};

const mapStateToProps = (state) => ({
	wordCount: state.wordCount.wordCount,
	auth: state.auth,
	mode: state.modes.mode
});

export default connect(mapStateToProps, null)(PillarLeft);
