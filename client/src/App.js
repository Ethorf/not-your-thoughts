import React, { useEffect } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { ToastContainer } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import 'react-toastify/dist/ReactToastify.css'

import PrivateRoute from './components/higherOrderComponents/PrivateRoute/PrivateRoute.js'
import { useSelector, connect } from 'react-redux'
import './App.scss'
import NavBarSide from './components/nav/navBarSide.js'
import NavBarTop from './components/nav/navBarTop.js'
import AudioPlayer from './components/audioPlayer/audioPlayer.js'
import GeneralNodeSelector from '@components/Shared/GeneralNodeSelector/GeneralNodeSelector.js'

//Pages Imports
import Landing from '@pages/Start/Start.js'
import Dashboard from '@pages/Dashboard/Dashboard.js'
import CreateJournalEntry from '@pages/CreateJournalEntry/CreateJournalEntry.js'
import CreateNodeEntry from '@pages/CreateNodeEntry/CreateNodeEntry.js'
import EditNodeEntry from '@pages/EditNodeEntry/EditNodeEntry.js'
import Login from '@pages/LoginPage/LoginPage.js'
import Register from '@pages/RegisterPage/RegisterPage.js'
import ProfilePage from '@pages/ProfilePage/ProfilePage.js'
import Resources from '@pages/ResourcesPage/ResourcesPage.js'
import Modes from '@pages/ModesPage/ModesPage.js'
import About from '@pages/AboutPage/About.js'
import Entries from '@pages/EntriesPage/EntriesPage.js'

//Redux
import store from './redux/store/index'
import { loadUser } from './redux/actions/authActions'
import setAuthToken from './utils/setAuthToken'
import { ModalsContainer } from './components/Modals/ModalsContainer/ModalsContainer.js'

if (localStorage.token) {
  setAuthToken(localStorage.token)
}

const App = () => {
  // This one is basically just checking if you're already logged in
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])

  const mode = useSelector((state) => state.modes.mode)
  const { user } = useSelector((state) => state.auth)

  return (
    <div className={`App ${mode}`}>
      <ToastContainer />
      <Tooltip id="main-tooltip" style={{ zIndex: 99999 }} place="right" />
      <BrowserRouter>
        <ModalsContainer />
        <NavBarTop />
        <NavBarSide />
        <AudioPlayer />
        {user && <GeneralNodeSelector />}
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
                  <PrivateRoute path="/dashboard" exact component={Dashboard} />
                  <PrivateRoute path="/create-journal-entry" exact component={CreateJournalEntry} />
                  <PrivateRoute path="/profile" exact component={ProfilePage} />
                  <PrivateRoute path="/create-node-entry" exact component={CreateNodeEntry} />
                  <PrivateRoute path="/edit-node-entry" component={EditNodeEntry} />
                  <PrivateRoute path="/entries" exact component={Entries} />
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
