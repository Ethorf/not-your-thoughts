import { createTheme } from '@material-ui/core';

export const muiTheme = createTheme({
	typography: {
		fontFamily: 'Poppins',
		fontSize: 12
	},
	palette: {
		primary: { main: '#DF1B1B' },
		secondary: { main: '#c0c0c0' },

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
				padding: '3px',
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
