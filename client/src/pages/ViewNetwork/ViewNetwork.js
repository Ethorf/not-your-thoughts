import React from 'react'
import { Redirect, useLocation } from 'react-router-dom'

/**
 * Legacy URL: `/view-network?userId=&entryId=` → unified local network on `/explore`.
 */
const ViewNetwork = () => {
  const { search } = useLocation()
  return <Redirect to={{ pathname: '/explore', search }} />
}

export default ViewNetwork
