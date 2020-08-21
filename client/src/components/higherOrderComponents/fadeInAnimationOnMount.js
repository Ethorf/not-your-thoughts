import React, { useRef, useEffect, useState } from 'react';
import { TimelineMax } from 'gsap';
import { Linear } from 'gsap/all';

const FadeInAnimationOnMount = ({ children, wrapperElement = 'div', direction = null, delay = 0.5, ...props }) => {
	let compRef = useRef(null);
	const Component = wrapperElement;
	const [animation, setAnimation] = useState(null);
	const animationTl = new TimelineMax({ paused: true });

	const distance = 100;
	let fadeDirection;
	let oppFadeDirection;

	switch (direction) {
		case 'left':
			fadeDirection = { x: -distance };
			oppFadeDirection = { x: distance };
			break;
		case 'right':
			fadeDirection = { x: distance };
			oppFadeDirection = { x: -distance };

			break;
		case 'up':
			fadeDirection = { y: distance };
			oppFadeDirection = { y: -distance };

			break;
		case 'down':
			fadeDirection = { y: -distance };
			oppFadeDirection = { y: distance };
			break;
		default:
			fadeDirection = { x: 0 };
	}
	useEffect(() => {
		setAnimation(
			animationTl
				.from(compRef.current, 1.7, {
					...fadeDirection,
					opacity: 0,
					...delay
				})
				.to(compRef.current, 1, {
					opacity: 1,
					...delay
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

export default FadeInAnimationOnMount;
