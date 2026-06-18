import * as THREE from 'three'

import { LOCAL_EXPLORE_MAIN_NODE_Y_OFFSET } from '@constants/spheres'

const DEFAULT_GRAPH_CENTER = [0, LOCAL_EXPLORE_MAIN_NODE_Y_OFFSET, 0]

const toVector3 = (value) => {
  if (value instanceof THREE.Vector3) return value.clone()
  if (Array.isArray(value)) return new THREE.Vector3(...value)
  return new THREE.Vector3(value.x, value.y, value.z)
}

/**
 * Orbital offset for sibling sub-connections in local explore view (any depth).
 * Places siblings diagonally relative to the direction from the graph center to the anchor node.
 */
export const getLocalSecondOrderSiblingOrbitalOffset = (
  parentWorldPosition,
  siblingIndex,
  orbitalRadius,
  graphCenter = DEFAULT_GRAPH_CENTER,
  depth = 1
) => {
  const parent = toVector3(parentWorldPosition)
  const center = toVector3(graphCenter)
  const radial3 = parent.clone().sub(center)

  const radial = new THREE.Vector2(radial3.x, radial3.y)
  if (radial.lengthSq() < 1e-8) {
    radial.set(1, 0)
  }
  radial.normalize()

  const perpendicular = new THREE.Vector2(-radial.y, radial.x)
  const index = Math.max(0, siblingIndex)
  const parentSideSign = radial.x >= 0 ? 1 : -1
  const alternatingSide = index % 2 === 0 ? -1 : 1
  const side = alternatingSide * parentSideSign
  const ring = Math.floor(index / 2)
  const depthScale = depth > 1 ? 0.9 ** (depth - 1) : 1
  const spread = orbitalRadius * (1 + ring * 0.48) * depthScale

  const diagonal = perpendicular
    .clone()
    .multiplyScalar(side)
    .add(radial.clone().multiplyScalar(0.65))
    .normalize()

  return new THREE.Vector3(diagonal.x * spread, diagonal.y * spread, 0)
}
