import * as THREE from 'three'

/**
 * With overlap prevention for 2nd order connections
 * Attempts to offset in z-direction or lateral direction to prevent overlaps
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
  // Check if too close to any existing position
  let tooClose = false
  for (const existingPos of existingPositions) {
    if (desiredPos.distanceTo(existingPos) < minDistance) {
      tooClose = true
      break
    }
  }

  if (!tooClose) return desiredPos

  // Try z-direction offset first
  const radius = clusterCenter.length()
  const zOffset = new THREE.Vector3(0, 0, 1) // Try positive z
  const candidateZ = desiredPos.clone().add(zOffset.clone().multiplyScalar(0.15)).normalize().multiplyScalar(radius)

  let stillTooClose = false
  for (const existingPos of existingPositions) {
    if (candidateZ.distanceTo(existingPos) < minDistance) {
      stillTooClose = true
      break
    }
  }

  if (!stillTooClose) return candidateZ

  // If z doesn't work, offset in the same lateral direction as the node relative to main center
  const mainNormal = clusterCenter.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const mainTangent1 = new THREE.Vector3().crossVectors(northPole, mainNormal).normalize()

  // Offset in the west direction if node is west, east if east
  const lateralOffset = mainTangent1.clone().multiplyScalar(isWestOfMain ? -0.2 : 0.2)
  const candidateLateral = desiredPos.clone().add(lateralOffset).normalize().multiplyScalar(radius)

  stillTooClose = false
  for (const existingPos of existingPositions) {
    if (candidateLateral.distanceTo(existingPos) < minDistance) {
      stillTooClose = true
      break
    }
  }

  if (!stillTooClose) return candidateLateral

  // If both fail, try a combined offset
  const combinedOffset = lateralOffset.clone().add(zOffset.clone().multiplyScalar(0.1))
  const candidateCombined = desiredPos.clone().add(combinedOffset).normalize().multiplyScalar(radius)
  return candidateCombined
}
