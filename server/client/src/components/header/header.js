import React from 'react';
import { connect } from 'react-redux';
import posed from 'react-pose';
import '../../pages/main/main.scss';

const HeaderPosed = posed.div({
	hidden: { opacity: 0.7 },
	visible: { opacity: 0.9 }
});

class Header extends React.Component {
	state = {
		isVisible: true
	};
	componentDidMount() {
		setInterval(() => {
			this.setState({ isVisible: !this.state.isVisible });
		}, 2600);
	}
	render() {
		return (
			<HeaderPosed
				pose={this.state.isVisible ? 'visible' : 'hidden'}
				className={`main__header${this.props.mode}`}
			>
				Not Your Thoughts
			</HeaderPosed>
		);
	}
}

const mapStateToProps = (state) => ({
	mode: state.modes.mode
});

export default connect(mapStateToProps)(Header);
