import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.scss';
import NavBarSide from './components/nav/navBarSide.js'
import AudioPlayer from './components/audioPlayer/audioPlayer.js'
import Landing from './pages/landing/landing'
import Main from './pages/main/main'
import MainV2 from './pages/main/mainV2'
import Login from './pages/login/login.js'
import Register from './pages/register/register.js'
import Profile from './pages/profile/profile'
import Resources from './pages/resources/resources'
import { CSSTransition, TransitionGroup } from "react-transition-group";
import PrivateRoute from "./components/private-route/privateRoute";
import axios from 'axios'
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken"
import { setCurrentUser, logoutUser } from "./redux/actions/authActions";
import store from './redux/store/index.js'

// Check for token to keep user logged in
//this entire section is more or less the logic that keeps a route private
// based on the status of the token and will dispatch
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
// Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = "./login";
  }
}

class App extends React.Component {

 state={
   resources:[],
   rubberDuckyUnlocked:false,
   currentUser:{}
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

  getUserData=()=>{
    axios.get("http://localhost:8080/users" ).then(response => {
      this.setState({
        currentUser:response.data[0]
      })
    }).catch(error=>console.log(error, "you had errorboi getUserData"))
  }
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
                    {/* <Route path='/main' exact> 
                    { ({ match }) =>  <Main rubberDuckyToggle={this.rubberDuckyToggle}  rubberDucky={this.state.rubberDucky} increaseDays={this.increaseDays} currentUser={this.state.currentUser} show={match !== null} /> }
                    </Route> */}
                    <PrivateRoute path='/main' exact> 
                    { ({ match }) =>  <Main rubberDuckyToggle={this.rubberDuckyToggle}  rubberDucky={this.state.rubberDucky} increaseDays={this.increaseDays} currentUser={this.state.currentUser} show={match !== null} /> }
                    </PrivateRoute>
                    <Route path='/login' exact> 
                    { ({ match }) =>  <Login rubberDuckyToggle={this.rubberDuckyToggle}  rubberDucky={this.state.rubberDucky} increaseDays={this.increaseDays} currentUser={this.state.currentUser} show={match !== null} /> }
                    </Route>
                    <Route path='/register' exact> 
                    { ({ match }) =>  <Register rubberDuckyToggle={this.rubberDuckyToggle}  rubberDucky={this.state.rubberDucky} increaseDays={this.increaseDays} currentUser={this.state.currentUser} show={match !== null} /> }
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
