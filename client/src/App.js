import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.scss';
import Landing from './pages/landing/landing'
import Main from './pages/main/main'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <BrowserRouter>
        <Switch>
          <Route path='/' exact render={() => <Landing  />} />
          <Route path='/main' exact render={() => <Main />} />
        </Switch>
      </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
