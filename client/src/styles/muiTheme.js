import { createMuiTheme } from '@material-ui/core';

export const muiTheme = createMuiTheme({
	typography: {
		fontFamily: '"Roboto"',
		fontSize: 12,
		h1: {
			// could customize the h1 variant as well
		}
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
				padding: '10px',
				color: 'white',
				backgroundColor: 'black',
				margin: '5px 10px'
			}
		},
		MuiContainer: {
			root: {
				color: 'white',
				backgroundColor: 'black',
				border: '1px solid grey',
				borderRadius: '7px'
			}
		}
	}
});
