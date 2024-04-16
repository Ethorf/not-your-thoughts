import React from 'react'

export const FavStarIcon = (props) => {
  return (
    <svg
      viewBox="0 0 67 63"
      {...props}
      data-tooltip-id="main-tooltip"
      data-tooltip-content={props.starred ? 'Unfavourite' : 'Favourite'}
    >
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M 46.296296,51.906272 L 31.916351,42.474649 L 17.502712,51.8547 L 22.029072,35.264028 L 8.654054,24.454438 L 25.831443,23.632463 L 31.978866,7.5717174 L 38.068716,23.65438 L 55.243051,24.537884 L 41.829396,35.299492 L 46.296296,51.906272 z "
        transform="matrix(0.986858,0,0,1.03704,0.471316,1.159472)"
      />
    </svg>
  )
}
