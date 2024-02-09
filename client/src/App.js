import React, { useEffect } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import PrivateRoute from './components/higherOrderComponents/PrivateRoute/PrivateRoute.js'
import { useSelector, connect } from 'react-redux'
import { MuiThemeProvider } from '@material-ui/core'
import { muiTheme } from './styles/muiTheme.js'
import './App.scss'
import NavBarSide from './components/nav/navBarSide.js'
import NavBarTop from './components/nav/navBarTop.js'
import AudioPlayer from './components/audioPlayer/audioPlayer.js'
import Timer from './components/timer/timer.js'

//Pages Imports
import Landing from './pages/landing/landing'
import Main from './pages/Main/Main.js'
import Login from './pages/Login/Login.js'
import Register from './pages/Register/Register.js'
import Profile from './pages/profile/profile'
import Resources from './pages/resources/resources'
import Modes from './pages/modes/modes.js'
import About from './pages/About/about.js'
import Entries from './pages/Entries/entries.js'

//redux Stuff
import store from './redux/store/index'
import { loadUser } from './redux/actions/authActions'
import setAuthToken from './utils/setAuthToken'

if (localStorage.token) {
  setAuthToken(localStorage.token)
}

const App = () => {
  // This one is basically just checking if you're already logged in
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])
  const mode = useSelector((state) => state.modes.mode)

  return (
    <MuiThemeProvider theme={muiTheme}>
      <div className={`App ${mode}`}>
        <BrowserRouter>
          <NavBarTop />
          <NavBarSide />
          <AudioPlayer />
          <Timer />
          <Route
            render={({ location }) => (
              <TransitionGroup>
                <CSSTransition
                  key={location.key}
                  timeout={1100}
                  classNames={mode === '-light' ? 'fade' : 'fad'}
                  unmountOnExit
                >
                  <Switch location={location}>
                    <Route path="/" exact>
                      {({ match }) => <Landing show={match !== null} />}
                    </Route>
                    <Route path="/login" exact>
                      {({ match }) => <Login show={match !== null} />}
                    </Route>
                    <Route path="/register" exact>
                      {({ match }) => <Register show={match !== null} />}
                    </Route>
                    <PrivateRoute path="/main" exact component={Main} />
                    <PrivateRoute path="/profile">{({ match }) => <Profile show={match !== null} />}</PrivateRoute>
                    <PrivateRoute path="/entries">{({ match }) => <Entries show={match !== null} />}</PrivateRoute>
                    <Route path="/resources" exact>
                      {({ match }) => <Resources show={match !== null} />}
                    </Route>
                    <Route path="/modes" exact>
                      {({ match }) => <Modes show={match !== null} />}
                    </Route>
                    <Route path="/about" exact>
                      {({ match }) => <About show={match !== null} />}
                    </Route>
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
            )}
          ></Route>
        </BrowserRouter>
      </div>
    </MuiThemeProvider>
  )
}

const mapStateToProps = (state) => ({
  mode: state.modes.mode,
})

export default connect(mapStateToProps, { loadUser })(App)
