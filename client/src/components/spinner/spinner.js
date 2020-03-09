import React from 'react';
import spinner from '../../assets/Icons/loading-spinner-black.gif';
import './spinner.scss';

export default () => (
	<div className={`spinner`}>
		{/* <h1 className="spinner__loading">Loading..</h1> */}
		<img src={spinner} style={{ width: '100px', margin: 'auto', display: 'block' }} alt="Loading..." />
	</div>
);
