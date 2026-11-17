import React, { useEffect } from 'react'
import { BrowserRouter, Route, Switch, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import 'react-toastify/dist/ReactToastify.css'

import PrivateRoute from './components/higherOrderComponents/PrivateRoute/PrivateRoute.js'
import { useSelector, connect } from 'react-redux'
import useIsMobile from './hooks/useIsMobile'
import './App.scss'

// Components
import LeftMainNavigation from '@components/nav/LeftMainNavigation'
import RightSidebar from '@components/RightSidebar/RightSidebar.js'
import DailyGoalToastManager from '@components/DailyGoalToastManager/DailyGoalToastManager'

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
import History from '@pages/History/History.js'
import ViewNetwork from '@pages/ViewNetwork/ViewNetwork.js'
import PublicNodeEntry from '@pages/PublicNodeEntry/PublicNodeEntry.js'
import PublicDashboard from '@pages/PublicDashboard/PublicDashboard.js'

//Redux
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
  const { user } = useSelector((state) => state.auth)

  return (
    <>
      <ModalsContainer />
      <DailyGoalToastManager />
      <LeftMainNavigation />
      {user && <RightSidebar />}
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
        <Route path="/explore" exact component={Explore} />
        <PrivateRoute path="/create-journal-entry" exact component={CreateJournalEntry} />
        <PrivateRoute path="/profile" exact component={ProfilePage} />
        <PrivateRoute path="/edit-node-entry" component={EditNodeEntry} />
        <PrivateRoute path="/history" exact component={History} />
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
    </>
  )
}

const App = ({ loadUser }) => {
  useEffect(() => {
    checkServerStatus('/api/health', 5000)
  }, [])

  // Restore auth state on mount when token exists (e.g. after page refresh)
  useEffect(() => {
    if (localStorage.token) {
      loadUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  // Lock the pre-keyboard layout height, and shrink only while an editor is focused.
  useEffect(() => {
    const root = document.documentElement

    const setAppHeight = () => {
      root.style.setProperty('--nyt-app-height', `${window.innerHeight}px`)
    }

    const isEditingText = () => {
      const active = document.activeElement
      if (!active) {
        return false
      }
      const tag = active.tagName
      return (
        active.isContentEditable ||
        tag === 'TEXTAREA' ||
        tag === 'INPUT' ||
        active.classList?.contains('ql-editor')
      )
    }

    const clearKeyboardInset = () => {
      root.style.setProperty('--nyt-keyboard-inset', '0px')
      root.dataset.nytKeyboard = 'closed'
    }

    const setKeyboardInset = () => {
      const vv = window.visualViewport
      // Safari chrome alone can make visualViewport < innerHeight — ignore unless typing.
      if (!vv || !isEditingText()) {
        clearKeyboardInset()
        return
      }

      const lockedHeight =
        parseFloat(root.style.getPropertyValue('--nyt-app-height')) || window.innerHeight
      const inset = Math.max(0, Math.round(lockedHeight - vv.height - vv.offsetTop))
      // Real keyboards are large; small gaps are browser UI, not the keyboard.
      if (inset < 140) {
        clearKeyboardInset()
        return
      }

      root.style.setProperty('--nyt-keyboard-inset', `${inset}px`)
      root.dataset.nytKeyboard = 'open'
    }

    setAppHeight()
    clearKeyboardInset()

    const handleOrientationChange = () => {
      window.setTimeout(() => {
        setAppHeight()
        setKeyboardInset()
      }, 150)
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    document.addEventListener('focusin', setKeyboardInset)
    document.addEventListener('focusout', setKeyboardInset)
    window.visualViewport?.addEventListener('resize', setKeyboardInset)
    window.visualViewport?.addEventListener('scroll', setKeyboardInset)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      document.removeEventListener('focusin', setKeyboardInset)
      document.removeEventListener('focusout', setKeyboardInset)
      window.visualViewport?.removeEventListener('resize', setKeyboardInset)
      window.visualViewport?.removeEventListener('scroll', setKeyboardInset)
    }
  }, [])

  const mode = useSelector((state) => state.modes.mode)
  const isMobile = useIsMobile()

  return (
    <div className={`App ${mode}`}>
      <ToastContainer />
      {!isMobile && <Tooltip id="main-tooltip" style={{ zIndex: 99999, fontSize: '0.6rem' }} place="top" />}
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
