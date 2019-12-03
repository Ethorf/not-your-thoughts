import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.scss';
import { play, exit } from './misc/transitionTimeline.js'

import Landing from './pages/landing/landing'
import Main from './pages/main/main'
import Profile from './pages/profile/profile'
import Resources from './pages/resources/resources'


class App extends React.Component {
  render(){
    return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <Route path='/' exact>
            { ({ match }) =>  <Landing show={match !== null} /> }
            </Route>
            <Route path='/main' exact>
            { ({ match }) =>  <Main show={match !== null} /> }
            </Route>
            <Route path='/profile' exact>
            { ({ match }) =>  <Profile show={match !== null} /> }
            </Route>
            <Route path='/resources' exact>
            { ({ match }) =>  <Resources show={match !== null} /> }
            </Route>
          </Switch>
        </BrowserRouter>

      </div>
    );
  }
 
}

export default App;
