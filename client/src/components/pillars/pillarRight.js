import React from 'react'
import PropTypes from 'prop-types'
import { connect } from "react-redux";
import '../../pages/main/main.scss'
import PillarRightOutline from '../../assets/Pillars/PillarLeft-5-shadowboi.png'
import crawBoxRight from '../../assets/Pillars/NuCrawBoxAnim-2-right.gif'



const PillarRight = ({wordCount}) => {

    const pillarRightStyleHeight = () =>{
        const testStyle = {
          height:`${(-200 + wordCount+1 )}%`
        };
        const start = {height:`0%`}
        const limit = {height:`100%`}
        if (wordCount <= 200){
          return start
        } else if(wordCount >= 200 && wordCount <= 300  ) {
          return testStyle
        } else {
          return limit
        }
      }
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


           <img className="main__pillar-right-outline"
             src={PillarRightOutline} alt='pillar Shadow thing'></img>
           <img className="main__pillar-right"
            src={crawBoxRight}
            style={pillarRightStyleHeight()}
            ></img>          
        </div>
    )
}

PillarRight.propTypes = {

}

const mapStateToProps = state => ({
    wordCount: state.wordCount.wordCount,
  });


export default connect(mapStateToProps,null)(PillarRight);