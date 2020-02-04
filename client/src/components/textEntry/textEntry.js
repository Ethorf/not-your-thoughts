import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../redux/actions/authActions";
import { changeWordCount } from "../../redux/actions/index";


function mapDispatchToProps(dispatch) {
    return {
      changeWordCount: words => dispatch(changeWordCount(words))
    };
  }
  

const TextEntry =()=> {

    // onLogoutClick = e => {
    //   e.preventDefault();
    //   this.props.logoutUser();
    // };

    const textNum = (e) => {
        e.preventDefault();
        this.props.changeWordCount(e.target.value.split(' ').filter(item => item !== '').length)
    }
      const { user } = this.props.auth;
        return(
            
            <div className="main__date-goal-wordcount-textarea-container">

            <h4>
              <b>Hey there,</b> {user.name.split(" ")[0]}
              <p className="flow-text grey-text text-darken-1">
                You are logged into a full-stack{" "}
                <span style={{ fontFamily: "monospace" }}>MERN</span> app 👏
              </p>
            </h4>
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem"
              }}
              onClick={this.onLogoutClick}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Logout
            </button>


                <div className="main__date-goal-wordcount-container">
                    <h3 className={`main__date`}>11/29/2019</h3>
                    <h2 className={`main__goal`} >{`Goal:400 words`}</h2>
                    <h3 className={`main__wordcount`}>
                    {this.props.wordCount} Words</h3>
            </div>
            <textarea 
                onChange={this.textNum}
                className={`main__textarea`}
                placeholder="note those thoughts here"></textarea>
        </div>
           );
    }
    


const mapStateToProps = state => ({
  auth: state.auth,
  wordCount: state.wordCount.wordCount
});


TextEntry.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};


export default connect(mapStateToProps,mapDispatchToProps)(TextEntry);
