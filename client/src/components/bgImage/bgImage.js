import React, { Fragment, useRef, useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { TimelineMax } from 'gsap';
import '../../pages/main/main.scss';
import bgOverlayTextureWhite from '../../assets/Background-Images/bgImg-donut1.png';
import bgOverlayTextureWhiteInverted from '../../assets/Background-Images/bgImg-donut1-inverted.png';

const BgImage = () => {
	let bgImgContainer = useRef(null);
	const mode = useSelector((state) => state.modes.mode);
	const [bgAnimation, setBgAnimation] = useState(null);
	const tl = new TimelineMax({ repeat: -1 });

	const bgAnim = () => {
		setBgAnimation(
			tl
				.fromTo(bgImgContainer, { duration: 10, opacity: 0.026 }, { duration: 10, opacity: 0.08 })
				.to(bgImgContainer, { duration: 10, opacity: 0.017 })
				.play()
		);
	};
	useEffect(() => {
		bgAnim();
	}, []);

	return (
		<Fragment>
			<img
				alt=""
				ref={(img) => {
					bgImgContainer = img;
				}}
				className={`main__bg-img${mode}`}
				src={mode === '-light' ? bgOverlayTextureWhiteInverted : bgOverlayTextureWhite}
			></img>
		</Fragment>
	);
};

export default BgImage;
