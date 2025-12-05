import React, { useEffect } from 'react'
import { BrowserRouter, Route, Switch, useLocation } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { ToastContainer } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import 'react-toastify/dist/ReactToastify.css'

import PrivateRoute from './components/higherOrderComponents/PrivateRoute/PrivateRoute.js'
import { useSelector, connect } from 'react-redux'
import './App.scss'

// Components
import LeftMainNavigation from '@components/nav/LeftMainNavigation'
import RightSidebar from '@components/RightSidebar/RightSidebar.js'

import NavBarTop from '@components/nav/navBarTop'

//Pages Imports
import Landing from '@pages/Start/Start.js'
import Dashboard from '@pages/Dashboard/Dashboard.js'
import Explore from '@pages/Explore/Explore.js'
import CreateJournalEntry from '@pages/CreateJournalEntry/CreateJournalEntry.js'
import EditNodeEntry from '@pages/EditNodeEntry/EditNodeEntry.js'
import Login from '@pages/LoginPage/LoginPage.js'
import Register from '@pages/RegisterPage/RegisterPage.js'
import ProfilePage from '@pages/ProfilePage/ProfilePage.js'
import Resources from '@pages/ResourcesPage/ResourcesPage.js'
import Modes from '@pages/ModesPage/ModesPage.js'
import About from '@pages/AboutPage/About.js'
import Entries from '@pages/EntriesPage/EntriesPage.js'
import History from '@pages/History/History.js'
import ViewNetwork from '@pages/ViewNetwork/ViewNetwork.js'
import PublicNodeEntry from '@pages/PublicNodeEntry/PublicNodeEntry.js'
import PublicDashboard from '@pages/PublicDashboard/PublicDashboard.js'

//Redux
import store from './redux/store/index'
import { loadUser } from './redux/actions/authActions'
import setAuthToken from './utils/setAuthToken'
import { ModalsContainer } from './components/Modals/ModalsContainer/ModalsContainer.js'

// Utils
import { checkServerStatus } from '@utils/checkServerStatus'

if (localStorage.token) {
  setAuthToken(localStorage.token)
}

const AppContent = () => {
  const location = useLocation()
  const mode = useSelector((state) => state.modes.mode)
  const { user } = useSelector((state) => state.auth)

  // Hide NavBarTop for public routes
  const publicRoutes = ['/show-node-entry', '/public-dashboard', '/view-network']
  const isPublicRoute = publicRoutes.some((route) => location.pathname.startsWith(route))

  return (
    <>
      <ModalsContainer />
      {!isPublicRoute && <NavBarTop />}
      <LeftMainNavigation />
      {user && <RightSidebar />}
      <TransitionGroup>
        {/* TODO fix this transition or remove & change all together */}
        <CSSTransition
          // key={location.key}
          // timeout={1100}
          // classNames={mode === '-light' ? 'fade' : 'fad'}
          // unmountOnExit
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
            <PrivateRoute path="/explore" exact component={Explore} />
            <PrivateRoute path="/create-journal-entry" exact component={CreateJournalEntry} />
            <PrivateRoute path="/profile" exact component={ProfilePage} />
            <PrivateRoute path="/edit-node-entry" component={EditNodeEntry} />
            <PrivateRoute path="/history" exact component={History} />
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
            <Route path="/view-network" exact component={ViewNetwork} />
            <Route path="/show-node-entry" exact component={PublicNodeEntry} />
            <Route path="/public-dashboard" exact component={PublicDashboard} />
          </Switch>
        </CSSTransition>
      </TransitionGroup>
    </>
  )
}

const App = () => {
  // This one is basically just checking if you're already logged in
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])

  useEffect(() => {
    checkServerStatus('http://localhost:8086/api/health', 5000) // Adjust URL and interval as needed
  }, [])

  const mode = useSelector((state) => state.modes.mode)

  return (
    <div className={`App ${mode}`}>
      <ToastContainer />
      <Tooltip id="main-tooltip" style={{ zIndex: 99999, fontSize: '0.6rem' }} place="top" />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  )
}

const mapStateToProps = (state) => ({
  mode: state.modes.mode,
})

export default connect(mapStateToProps, { loadUser })(App)
