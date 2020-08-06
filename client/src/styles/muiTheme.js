import { createMuiTheme } from '@material-ui/core';

export const muiTheme = createMuiTheme({
	typography: {
		fontFamily: 'Poppins',
		fontSize: 12
	},
	palette: {
		primary: { main: '#DF1B1B' },
		background: {
			default: '#fbfcff'
		}
	},
	overrides: {
		MuiButton: {
			root: {
				color: 'white',
				backgroundColor: 'black',
				margin: '5px 10px',
				border: '1px solid silver',
				borderRadius: '4px',
				fontFamily: 'Syncopate',
				'&:hover': {
					backgroundColor: 'rgba(255, 255, 255, 0.95)',
					color: 'black'
				}
			},
			text: {
				padding: '3px 6px',
				color: 'white',
				backgroundColor: 'black',
				margin: '5px 10px',
				border: '1px solid silver',
				borderRadius: '4px',
				fontFamily: 'Syncopate',
				'&:hover': {
					backgroundColor: 'rgba(255, 255, 255, 0.95)',
					color: 'black'
				}
			}
		},
		MuiContainer: {
			root: {
				color: 'white',
				backgroundColor: 'black',
				border: '1px solid grey',
				borderRadius: '7px',
				padding: '15px',
				fontFamily: 'Poppins'
			}
		},
		MuiDialog: {
			root: {
				color: 'white',
				borderRadius: '7px',
				padding: '15px'
			}
		},
		MuiInput: {
			root: {
				color: 'white',
				borderRadius: '7px',
				padding: '5px',
				textAlign: 'center',
				border: '1px solid grey'
			},
			text: {
				color: 'white',
				textAlign: 'center'
			}
		}
	}
});
