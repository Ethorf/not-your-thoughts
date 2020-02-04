import React, {Fragment, useEffect} from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import PrivateRoute from "./components/private-route/privateRoute";
import { Provider } from "react-redux";
import './App.scss';
import NavBarSide from './components/nav/navBarSide.js'
import AudioPlayer from './components/audioPlayer/audioPlayer.js'
//Pages Imports
import Landing from './pages/landing/landing'
import Main from './pages/main/main'
import MainV2 from './pages/main/mainV2'
import UserDisplayTest from './components/userDisplayTest/userDisplayTest'
import Login from './pages/login/login.js'
import Register from './pages/register/register.js'
import Profile from './pages/profile/profile'
import Resources from './pages/resources/resources'
import store from "./redux/store/index";
import { loadUser } from './redux/actions/authActions';

import setAuthToken from "./utils/setAuthToken"

if (localStorage.token) {
  setAuthToken(localStorage.token);
}


const App = () => {

  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

    return (
      <div className="App">
        <Provider store={store}>
        <BrowserRouter>
          <NavBarSide  />
          <AudioPlayer  />
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
                    <PrivateRoute path='/main' exact> 
                    { ({ match }) =>  <UserDisplayTest   show={match !== null} /> }
                    </PrivateRoute>
                    <Route path='/login' exact> 
                    { ({ match }) =>  <Login show={match !== null} /> }
                    </Route>
                    <Route path='/register' exact> 
                    { ({ match }) =>  <Register  show={match !== null} /> }
                    </Route>
                    <Route path='/profile'>
                    { ({ match }) =>  <Profile show={match !== null} /> }
                    </Route>
                    <Route path='/resources' exact>
                    { ({ match }) =>  <Resources show={match !== null} /> } 
                    </Route>
                  </Switch>
              </CSSTransition>
            </TransitionGroup>
          )}>
            </Route>
          </BrowserRouter>
        </Provider>
      </div>
    );
}

export default App;
