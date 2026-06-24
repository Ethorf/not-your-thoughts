import * as THREE from 'three'

import { CONNECTION_TYPES } from '@constants/connectionTypes'

const { SIBLING } = CONNECTION_TYPES.FRONTEND

/**
 * Push a node outward along its radial from the layout center.
 */
export const applyRadialSpreadFromCenter = ({ fittedPosition, layoutCenter, spreadAmount }) => {
  if (spreadAmount <= 0) {
    return fittedPosition instanceof THREE.Vector3
      ? fittedPosition.clone()
      : new THREE.Vector3(...fittedPosition)
  }

  const fitted = fittedPosition instanceof THREE.Vector3 ? fittedPosition.clone() : new THREE.Vector3(...fittedPosition)
  const center = layoutCenter instanceof THREE.Vector3 ? layoutCenter : new THREE.Vector3(...layoutCenter)
  const offset = fitted.clone().sub(center)

  if (offset.lengthSq() < 1e-8) {
    return fitted
  }

  return fitted.add(offset.normalize().multiplyScalar(spreadAmount))
}

/**
 * Push a first-order sibling outward along its radial from the layout center.
 * Same delta for every sibling so ring spacing stays equal.
 */
export const applyUniformSiblingRadialSpread = ({
  fittedPosition,
  layoutCenter,
  spreadAmount,
  connectionType,
}) => {
  if (connectionType !== SIBLING || spreadAmount <= 0) {
    return fittedPosition instanceof THREE.Vector3
      ? fittedPosition.clone()
      : new THREE.Vector3(...fittedPosition)
  }

  return applyRadialSpreadFromCenter({ fittedPosition, layoutCenter, spreadAmount })
}
