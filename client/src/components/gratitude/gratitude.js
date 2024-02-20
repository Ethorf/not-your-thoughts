import React from 'react'
import './gratitude.scss'

export const Gratitude = (props) => {
  return (
    <form className={`gratitude`}>
      <h2 className={`gratitude__header`}>Quickly Describe 6 things you are grateful for</h2>
      <div className={`gratitude__two-input-container`}>
        <input disableUnderline="true" placeholder="gratitude here" />
        <input disableUnderline="true" placeholder="gratitude here" />
      </div>
      <div className={`gratitude__two-input-container`}>
        <input disableUnderline="true" placeholder="gratitude here" />
        <input disableUnderline="true" placeholder="gratitude here" />
      </div>
      <div className={`gratitude__two-input-container`}>
        <input disableUnderline="true" placeholder="gratitude here" />
        <input disableUnderline="true" placeholder="gratitude here" />
      </div>
      <button onClick={props.closeGratitude} className={`gratitude__done-button`}>
        Done
      </button>
    </form>
  )
}

export default Gratitude
