import * as THREE from 'three'

/** Offset magnitude for overlap prevention - must be large enough to achieve minDistance separation */
const OVERLAP_OFFSET_MAGNITUDE = 0.45

/**
 * Check if a candidate position is at least minDistance from all existing positions
 */
const isClear = (candidate, existingPositions, minDistance) => {
  for (const existingPos of existingPositions) {
    if (candidate.distanceTo(existingPos) < minDistance) return false
  }
  return true
}

/**
 * With overlap prevention for 2nd order connections
 * Attempts to offset along the sphere surface in multiple directions to prevent overlaps
 * @param {THREE.Vector3} desiredPos - The desired position from the positioning algorithm
 * @param {THREE.Vector3} nodePosition - The position of the parent node
 * @param {boolean} isWestOfMain - Whether the parent node is west of the main center
 * @param {THREE.Vector3} clusterCenter - The center position of the cluster
 * @param {Iterable<THREE.Vector3>} existingPositions - All existing node positions to check against
 * @param {number} minDistance - Minimum distance between nodes to prevent overlap (default 0.4)
 * @returns {THREE.Vector3} - The resolved position (may be offset to prevent overlap)
 */
export const resolvePositionWithOverlapPrevention = (
  desiredPos,
  nodePosition,
  isWestOfMain,
  clusterCenter,
  existingPositions,
  minDistance = 0.4
) => {
  const positionsArray = [...existingPositions]
  if (isClear(desiredPos, positionsArray, minDistance)) return desiredPos

  const radius = clusterCenter.length()
  const normal = desiredPos.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()
  if (tangent2.dot(northPole) < 0) tangent2.negate()

  const offset = OVERLAP_OFFSET_MAGNITUDE
  const mainTangent = new THREE.Vector3().crossVectors(northPole, clusterCenter.clone().normalize()).normalize()
  const lateralSign = isWestOfMain ? -1 : 1

  const candidates = [
    desiredPos.clone().add(tangent1.clone().multiplyScalar(offset)).normalize().multiplyScalar(radius),
    desiredPos.clone().add(tangent1.clone().multiplyScalar(-offset)).normalize().multiplyScalar(radius),
    desiredPos.clone().add(tangent2.clone().multiplyScalar(offset)).normalize().multiplyScalar(radius),
    desiredPos.clone().add(tangent2.clone().multiplyScalar(-offset)).normalize().multiplyScalar(radius),
    desiredPos.clone().add(mainTangent.clone().multiplyScalar(lateralSign * offset)).normalize().multiplyScalar(radius),
    desiredPos.clone().add(tangent1.clone().multiplyScalar(0.7 * offset)).add(tangent2.clone().multiplyScalar(0.7 * offset)).normalize().multiplyScalar(radius),
  ]

  for (const candidate of candidates) {
    if (isClear(candidate, positionsArray, minDistance)) return candidate
  }

  return candidates[0]
}
