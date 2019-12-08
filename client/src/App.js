import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.scss';

import Landing from './pages/landing/landing'
import Main from './pages/main/main'
import MainContainer from './pages/main-container/main-container.js'
import Profile from './pages/profile/profile'
import Resources from './pages/resources/resources'
import { CSSTransition, TransitionGroup } from "react-transition-group";



class App extends React.Component {
 state={
  rubberDuckyUnlocked:false,
   currentUser:{
      firstName:"Eric",
      lastName:"Thorfinnson",
      conDays:2,
      totDays:3,
      rubberDucky:false
    }
 }

 increaseDays = (curCon,curTot)=>{
   setTimeout(()=>{
    this.setState({
      currentUser:{
        firstName:"Eric",
        lastName:"Thorfinnson",
        conDays:curCon+1,
        totDays:curTot+1
    }
     })
   },70)
 }

 rubberDuckyToggle=(prevProps,prevState)=>{
  this.setState(prevState => ({
    rubberDucky: !prevState.rubberDucky
  }));
  console.log(this.state.rubberDucky)
}
  componentDidMount(){
    if (this.state.conDays >= 3){
      this.setState({

        rubberDuckyUnlocked:true

      })
    }
  }

  render(){
    return (
      <div className="App">
        <BrowserRouter>
          <Route render={({location})=>(
             <TransitionGroup>
             <CSSTransition
              key={location.key}
               timeout={1000}
               classNames="fade"> 
                 <Switch location={location}>
                   <Route path='/' exact>
                   { ({ match }) =>  <Landing show={match !== null} /> }
                   </Route>
                   
                   <Route path='/main' exact> 
                   { ({ match }) =>  <Main rubberDuckyToggle={this.rubberDuckyToggle}  rubberDucky={this.state.rubberDucky} increaseDays={this.increaseDays} currentUser={this.state.currentUser} show={match !== null} /> }
                   </Route>
                   <Route path='/profile'>
                   { ({ match }) =>  <Profile conDays={this.state.conDays} rubberDuckyToggle={this.rubberDuckyToggle} rubberDucky={this.state.rubberDucky} rubberDuckyUnlocked={this.state.rubberDuckyUnlocked} increaseDays={this.increaseDays} currentUser={this.state.currentUser} show={match !== null} /> }
                   </Route>
                   <Route path='/resources' exact>
                   { ({ match }) =>  <Resources show={match !== null} /> } 
                    </Route>

                    <Route path='/mainContainer/' exact>
                   { ({ match }) =>  <MainContainer currentUser={this.state.currentUser} show={match !== null} /> }
                   </Route>
                   {/* <Route path='/mainContainer/profile' component={Profile}>
                   { ({ match }) =>  <Profile currentUser={this.state.currentUser} show={match !== null} /> } 
                   </Route> 
                   <Route path='/mainContainer/resources' exact component={Resources}>
                   { ({ match }) =>  <Resources currentUser={this.state.currentUser} show={match !== null} /> } 
                   </Route>  */}


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

export default App;
