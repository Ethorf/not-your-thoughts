import React, { useEffect } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import PrivateRoute from './components/higherOrderComponents/PrivateRoute/PrivateRoute.js'
import { useSelector, connect } from 'react-redux'
import './App.scss'
import NavBarSide from './components/nav/navBarSide.js'
import NavBarTop from './components/nav/navBarTop.js'
import AudioPlayer from './components/audioPlayer/audioPlayer.js'
import Timer from './components/timer/timer.js'

//Pages Imports
import Landing from './pages/Landing/Landing.js'
import EntryTypeSwitcher from './pages/EntryTypeSwitcher/EntryTypeSwitcher.js'
import CreateJournalEntry from './pages/CreateJournalEntry/CreateJournalEntry.js'
import CreateNodeEntry from './pages/CreateNodeEntry/CreateNodeEntry.js'
import EditNodeEntry from './pages/EditNodeEntry/EditNodeEntry.js'
import Login from './pages/Login/Login.js'
import Register from './pages/Register/Register.js'
import Profile from './pages/Profile/Profile.js'
import Resources from './pages/resources/resources'
import Modes from './pages/modes/modes.js'
import About from './pages/About/About.js'
import Entries from './pages/Entries/Entries.js'

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

  // TODO make a Modals container higher order component and put here?
  return (
    <div className={`App ${mode}`}>
      <ToastContainer />
      {/* <SaveEntryModal />
          <SuccessModal />
          <IntroModal />
          <GuestModeModal
            toggleGuestModeModalOpen={() => setGuestModeModalOpen(!guestModeModalOpen)}
            guestModeModalOpen={guestModeModalOpen}
          /> */}
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
                  <PrivateRoute path="/entry-type-switcher" exact component={EntryTypeSwitcher} />
                  <PrivateRoute path="/create-journal-entry" exact component={CreateJournalEntry} />
                  <PrivateRoute path="/profile">{({ match }) => <Profile show={match !== null} />}</PrivateRoute>
                  <PrivateRoute path="/create-node-entry" exact component={CreateNodeEntry} />
                  <PrivateRoute path="/edit-node-entry" component={EditNodeEntry} />
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
        />
      </BrowserRouter>
    </div>
  )
}

const mapStateToProps = (state) => ({
  mode: state.modes.mode,
})

export default connect(mapStateToProps, { loadUser })(App)
