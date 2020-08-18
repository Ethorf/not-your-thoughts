import React, { useRef, useEffect, useState } from 'react';
import { gsap, TimelineMax } from 'gsap';

const FadeInAnimation = ({ children, wrapperElement = 'div', direction = null, delay = 1, ...props }) => {
	let compRef = useRef(null);
	const Component = wrapperElement;
	const [animation, setAnimation] = useState(null);
	const animationTl = new TimelineMax({ paused: true });

	const distance = 100;
	let fadeDirection;
	switch (direction) {
		case 'left':
			fadeDirection = { x: -distance };
			break;
		case 'right':
			fadeDirection = { x: distance };
			break;
		case 'up':
			fadeDirection = { y: distance };
			break;
		case 'down':
			fadeDirection = { y: -distance };
			break;
		default:
			fadeDirection = { x: 0 };
	}
	useEffect(() => {
		setAnimation(
			animationTl
				.from(compRef.current, 1, {
					...fadeDirection,
					opacity: 0,
					delay
				})
				.to(compRef.current, 1, {
					opacity: 1,
					delay
				})
				.play()
		);
	}, [compRef]);
	return (
		<Component ref={compRef} {...props}>
			{children}
		</Component>
	);
};

export default FadeInAnimation;
