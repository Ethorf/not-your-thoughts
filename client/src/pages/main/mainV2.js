import React from 'react';
import moment from 'moment'
import './main.scss';
import { useSelector, useDispatch } from 'react-redux';
import TextEntry from "../../components//textEntry/textEntry.js"


import posed from 'react-pose';
import { randomNum } from "../../functions/miscFunctions.js"
import { TimelineLite} from "gsap/all";




function MainV2() {
    const dispatch = useDispatch();

  return (
    <div className="main_all-container">
        <TextEntry />
    </div>
  );
}

export default MainV2;