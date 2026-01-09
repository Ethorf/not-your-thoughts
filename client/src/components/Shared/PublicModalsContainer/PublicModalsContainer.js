import React from 'react'
import { PublicHistoryModal } from '../PublicHistoryModal/PublicHistoryModal'
import { PublicConnectionsModal } from '../PublicConnectionsModal/PublicConnectionsModal'
import { PublicLegendModal } from '../PublicLegend/PublicLegendModal'

/**
 * Container component that renders all public modals
 * Each modal manages its own visibility through Redux state
 */
export const PublicModalsContainer = () => {
  return (
    <>
      <PublicHistoryModal />
      <PublicConnectionsModal />
      <PublicLegendModal />
    </>
  )
}

export default PublicModalsContainer






