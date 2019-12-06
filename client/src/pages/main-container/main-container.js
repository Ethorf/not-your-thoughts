import React from 'react';
import { Link, BrowserRouter, Route, Switch } from 'react-router-dom';
import './main-container.scss';

import NavBarSide from '../../components/nav/navBarSide.js'
import Main from '../main/main'
import Profile from '../profile/profile'
import Resources from '../resources/resources'
import { CSSTransition, TransitionGroup } from "react-transition-group";

function Box1(){
  return(
    <div className="box1">box 1</div>
  )
}

function Box2(){
  return(
    <div className="box2">box 2</div>
  )
}

class MainContainer extends React.Component {
 
  render(){
    const {match} = this.props;
    return (
      <div className="main-container">
        <NavBarSide />
        <Link to="mainContainer/box1">Box1</Link>
        <Link to="mainContainer/box2">Box2</Link>
        <BrowserRouter>
           {/* <Route render={({location})=>(
             <TransitionGroup>
             <CSSTransition
              key={location.key}
               timeout={1000}
               classNames="fade"> 
                 <Switch location={location}>
                   <Route path='/mainContainer/main' exact render={()=><Main currentUser={this.props.currentUser} /> } />
                   <Route path='/mainContainer/profile' exact render={()=><Profile currentUser={this.props.currentUser} /> } />
                   <Route path='/mainContainer/resources' exact component={Resources} />
                 </Switch>
             </CSSTransition>
           </TransitionGroup>
          )}>
          </Route>

           */}
        <Route path="mainContainer/Box1" component={this.Box1}/>
        <Route path="mainContainer/Box2" component={Box2}/>


        </BrowserRouter>

      </div>
    );
  }
 
}

export default MainContainer;
