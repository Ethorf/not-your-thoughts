import * as THREE from 'three'

/**
 * Check if a candidate position is closer than minDistance to any of the existing positions
 * existingPositions: Iterable<THREE.Vector3>
 */
export const isTooCloseToAny = (candidate, existingPositions, minDistance) => {
  for (const existing of existingPositions) {
    if (candidate.distanceTo(existing) < minDistance) return true
  }
  return false
}

/**
 * Attempt to resolve overlaps by jittering the desired position tangentially and reprojecting to the sphere.
 * - desiredPos: THREE.Vector3 (on sphere)
 * - sphereRadius: number (length of vectors on sphere)
 * - existingPositions: Iterable<THREE.Vector3>
 * - minDistance: number
 * - maxAttempts: number
 */
export const findNonOverlappingPosition = (
  desiredPos,
  sphereRadius,
  existingPositions,
  minDistance = 0.4,
  maxAttempts = 24
) => {
  if (!isTooCloseToAny(desiredPos, existingPositions, minDistance)) return desiredPos

  // Build an orthonormal tangent frame around desiredPos for deterministic jitter
  const normal = desiredPos.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()
  // In the rare case normal is colinear with northPole, cross would be zero; fallback
  if (!isFinite(tangent1.x) || tangent1.lengthSq() === 0) tangent1.set(1, 0, 0)
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()

  // Compute the arc angle needed to achieve at least minDistance along the sphere
  const baseArc = Math.min(Math.PI, Math.max(minDistance / Math.max(1e-6, sphereRadius), 0.01))

  // Try rotating around the surface normal by multiples of the base arc
  // Alternate directions to find nearest free slot deterministically
  for (let k = 1; k <= maxAttempts; k++) {
    const step = Math.ceil(k / 2)
    const dir = k % 2 === 0 ? -1 : 1
    const angle = dir * step * baseArc

    // Rotate desiredPos in its tangent plane: desiredPos *cos + (tangent1)*sin around normal
    const rotated = desiredPos.clone().applyAxisAngle(normal, angle).normalize().multiplyScalar(sphereRadius)
    if (!isTooCloseToAny(rotated, existingPositions, minDistance)) return rotated

    // Also try a second orthogonal tangent rotation using tangent2 direction
    const rotated2 = desiredPos
      .clone()
      .add(tangent2.clone().multiplyScalar(Math.sin(angle)))
      .normalize()
      .multiplyScalar(sphereRadius)
    if (!isTooCloseToAny(rotated2, existingPositions, minDistance)) return rotated2

    // Small combined rotation in both tangent axes
    const combined = desiredPos
      .clone()
      .add(
        tangent1
          .clone()
          .multiplyScalar(Math.sin(angle) * 0.7)
          .add(tangent2.clone().multiplyScalar(Math.cos(angle) * 0.7))
      )
      .normalize()
      .multiplyScalar(sphereRadius)
    if (!isTooCloseToAny(combined, existingPositions, minDistance)) return combined
  }

  // As a last resort, return the original position
  return desiredPos
}
