import React,  { useRef, useEffect, useState } from "react";
import { Redirect} from 'react-router-dom'
import { TweenMax, TimelineLite,Elastic, Back} from "gsap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { changeWordCount } from "../../redux/actions/index";
import { saveEntry } from '../../redux/actions/entryActions.js'
import '../../pages/main/main.scss'
import moment from 'moment'
//Component Imports
import Header from '../../components/header/header'
import BgImage from "../../components/bgImage/bgImage.js";
import Prompt from '../prompt/prompt.js'
import PillarTop from '../pillars/pillarTop.js'
import PillarLeft from '../pillars/pillarLeft.js'
import PillarRight from '../pillars/pillarRight.js'
import PillarBottom from '../pillars/pillarBottom.js'




const TextEntry =({auth:{ user }, wordCount, changeWordCount, saveEntry, isAuthenticated})=> {
  const [entryData,setEntryData] = useState({
    entry:''
  })

  if (!isAuthenticated) {
    return <Redirect to='/login' />;
  }
  const textNum = (e) => {
    e.preventDefault();
    setEntryData(e.target.value);
    changeWordCount(e.target.value.split(' ').filter(item => item !== '').length)

}

const onSubmit = async e => {
  e.preventDefault();
  saveEntry({entry:entryData});
};

    return(
    <div className="main__all-container modalize">
      {/* <BgImage /> */}
      <div className="main black">
        <Header/>
        <Prompt/>
        <PillarTop/>
        <div className="main__pillars-date-goal-wordcount-textarea-container">
        <PillarLeft />

          <form className="main__date-goal-wordcount-textarea-container"
                onSubmit={e => onSubmit(e)}>
            <div className="main__date-goal-wordcount-container">
              <h3 className={`main__date`}>{moment().format("MM/DD/YYYY")}</h3>
              <h2 className={`main__goal`} >{`Goal:400 words`}</h2>
              <button type="submit" className="main__save-button">Save Entry</button>
              <h3 className={`main__wordcount`}>{wordCount} Words</h3>
              
            </div>
            <textarea 
                onChange={textNum}
                name='textEntry'
                // value={entry}
                className={`main__textarea textarea-black`}
                placeholder="note those thoughts here"></textarea>
          </form>
          <PillarRight />    
        </div>
          <PillarBottom />

      </div>
    </div>
        );
    }
    

TextEntry.propTypes = {
  auth: PropTypes.object.isRequired,
  saveEntry:PropTypes.func.isRequired
};    

const mapStateToProps = state => ({
  auth: state.auth,
  wordCount: state.wordCount.wordCount,
  isAuthenticated: state.auth.isAuthenticated

});

function mapDispatchToProps(dispatch) {
  return {
    changeWordCount: words => dispatch(changeWordCount(words)),
    saveEntry: content => dispatch(saveEntry(content))
  };
}




export default connect(mapStateToProps,mapDispatchToProps)(TextEntry);
