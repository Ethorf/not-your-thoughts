import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './main-container.scss';

import NavBarSide from '../../components/nav/navBarSide.js'
import Main from '../main/main'
import Profile from '../profile/profile'
import Resources from '../resources/resources'
import { CSSTransition, TransitionGroup } from "react-transition-group";



class MainContainer extends React.Component {
 
  render(){
    return (
      <div className="main-container">
        <NavBarSide />
        <BrowserRouter>
          <Route render={({location})=>(
             <TransitionGroup>
             <CSSTransition
              key={location.key}
               timeout={1000}
               classNames="fade"> 
                 <Switch location={location}>
                   {/* <Route path='/' exact>
                   { ({ match }) =>  <Landing show={match !== null} /> }
                   </Route> */}
                   <Route path='/mainContainer' exact component={Main}>
                   {/* { ({ match }) =>  <Main show={match !== null} /> } */}
                   </Route>
                   <Route path='/mainContainer/profile' component={Profile}>
                   {/* { ({ match }) =>  <Profile show={match !== null} /> } */}
                   </Route>
                   <Route path='/mainContainer/resources' exact component={Resources}>
                   {/* { ({ match }) =>  <Resources show={match !== null} /> } */}
                   </Route>
                 </Switch>
             </CSSTransition>
           </TransitionGroup>
          )}>
          </Route>
         
          
        </BrowserRouter>

      </div>
    );
  }
 
}

export default MainContainer;
