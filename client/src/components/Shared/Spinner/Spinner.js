import React from 'react'
import spinner from '../../../assets/Icons/loading-spinner-black.gif'
import './Spinner.scss'

export default function Spinner() {
  return (
    <div className="spinner">
      <img src={spinner} style={{ width: '100px', margin: 'auto', display: 'block' }} alt="Loading..." />
    </div>
  )
}
