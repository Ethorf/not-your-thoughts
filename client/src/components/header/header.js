import React, { Component } from 'react'
import posed from 'react-pose';
import '../../pages/main/main.scss'



const HeaderPosed = posed.div({
    hidden: { opacity: 0.7 },
    visible: { opacity: 1 }
  });

export default class Header extends React.Component{
    state={
        isVisible: true
    }
    componentDidMount(){
        setInterval(() => {
          this.setState({ isVisible: !this.state.isVisible, 
          })
        }, 1600);
    }
    render(){
        return(
            <HeaderPosed pose={this.state.isVisible ? 'visible' : 'hidden'}
                         className='main__header'>
                Not Your Thoughts
            </HeaderPosed >
        )
    }
}
