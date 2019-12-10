import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.scss';
import NavBarSide from './components/nav/navBarSide.js'
import AudioPlayer from './components/audioPlayer/audioPlayer.js'
import Landing from './pages/landing/landing'
import Main from './pages/main/main'
import MainContainer from './pages/main-container/main-container.js'
import Profile from './pages/profile/profile'
import Resources from './pages/resources/resources'
import { CSSTransition, TransitionGroup } from "react-transition-group";
import axios from 'axios'

class App extends React.Component {

 state={
   resources:[],
  rubberDuckyUnlocked:false,
   currentUser:{}
 }

//  {
//   firstName:"Eric",
//   lastName:"Thorfinnson",
//   conDays:2,
//   totDays:3,
//   rubberDucky:false
// }
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

getUserData=()=>{
  axios.get("http://localhost:8080/users" ).then(response => {
    console.log(response.data)
    this.setState({
      currentUser:response.data[0]
    })
  }).catch(error=>console.log(error, "you had errorboi getUserData"))
}
// getResourcesData=()=>{
//   axios.get("http://localhost:8080/users" ).then(response => {
//     console.log(response.data)
//     this.setState({
//       currentUser:response.data[0]
//     })
//   }).catch(error=>console.log(error, "you had errorboi getResources"))
// }
  componentDidMount(){
    this.getUserData()
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
          <NavBarSide rubberDucky={this.state.rubberDucky} />
          <AudioPlayer rubberDucky={this.state.rubberDucky} />
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
                    { ({ match }) =>  <Profile conDays={this.state.currentUser.conDays} rubberDuckyToggle={this.rubberDuckyToggle} rubberDucky={this.state.rubberDucky} rubberDuckyUnlocked={this.state.rubberDuckyUnlocked} increaseDays={this.increaseDays} currentUser={this.state.currentUser} show={match !== null} /> }
                    </Route>
                    <Route path='/resources' exact>
                    { ({ match }) =>  <Resources rubberDucky={this.state.rubberDucky} show={match !== null} /> } 
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

export default App;
