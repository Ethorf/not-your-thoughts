import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PrivateRoute from './components/private-route/privateRoute';
import { useSelector, connect } from 'react-redux';
import './App.scss';
import NavBarSide from './components/nav/navBarSide.js';
import NavBarTop from './components/nav/navBarTop.js';

import AudioPlayer from './components/audioPlayer/audioPlayer.js';
//Pages Imports
import Landing from './pages/landing/landing';
import TextEntry from './components/textEntry/textEntry.js';
import Login from './pages/login/login.js';
import Register from './pages/register/register.js';
import Profile from './pages/profile/profile';
import Resources from './pages/resources/resources';
import Modes from './pages/modes/modes.js';
import About from './pages/about/about';

//redux Stuff
import store from './redux/store/index';
import { loadUser } from './redux/actions/authActions';
import setAuthToken from './utils/setAuthToken';

if (localStorage.token) {
	setAuthToken(localStorage.token);
}

const App = () => {
	useEffect(() => {
		store.dispatch(loadUser());
	}, []);
	const mode = useSelector((state) => state.modes.mode);

	return (
		<div className={`App ${mode}`}>
			<BrowserRouter>
				<NavBarTop />
				<NavBarSide />
				<AudioPlayer />
				<Route
					render={({ location }) => (
						<TransitionGroup>
							<CSSTransition
								key={location.key}
								timeout={1000}
								classNames={mode === '-light' ? 'fade' : 'fad'}
							>
								<Switch location={location}>
									<Route path="/" exact>
										{({ match }) => <Landing show={match !== null} />}
									</Route>
									<PrivateRoute path="/main" exact>
										{({ match }) => <TextEntry show={match !== null} />}
									</PrivateRoute>
									<Route path="/login" exact>
										{({ match }) => <Login show={match !== null} />}
									</Route>
									<Route path="/register" exact>
										{({ match }) => <Register show={match !== null} />}
									</Route>
									<PrivateRoute path="/profile">
										{({ match }) => <Profile show={match !== null} />}
									</PrivateRoute>
									<PrivateRoute path="/resources" exact>
										{({ match }) => <Resources show={match !== null} />}
									</PrivateRoute>
									<PrivateRoute path="/modes" exact>
										{({ match }) => <Modes show={match !== null} />}
									</PrivateRoute>
									<PrivateRoute path="/about" exact>
										{({ match }) => <About show={match !== null} />}
									</PrivateRoute>
								</Switch>
							</CSSTransition>
						</TransitionGroup>
					)}
				></Route>
			</BrowserRouter>
		</div>
	);
};

const mapStateToProps = (state) => ({
	mode: state.modes.mode
});

export default connect(mapStateToProps)(App);
