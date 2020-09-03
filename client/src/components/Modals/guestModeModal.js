import React from 'react';
import { Dialog, Container } from '@material-ui/core';

const GuestModeModal = (props) => {
	return (
		<Dialog open={props.guestModeModalOpen}>
			<Container>
				<div
					style={{
						display: 'flex',
						width: '100%',
						justifyContent: 'center',
						alignItems: 'center',
						flexDirection: 'column',
						textAlign: 'center'
					}}
				>
					<h1 className="entry-analysis-modal__header">Welcome to Not Your Thoughts Guest Human!</h1>
					<p>
						In this mode, saving entries, entry analysis, custom prompts, and all personal settings are
						disabled! But you can still get a sense for the vibes in your cranial space, and we encourage
						you to do just that! Happy Not Thoughtting!
					</p>
					<button className="entry-analysis-modal__close-button" onClick={props.toggleGuestModeModalOpen}>
						Close X
					</button>
				</div>
			</Container>
		</Dialog>
	);
};

export default GuestModeModal;
