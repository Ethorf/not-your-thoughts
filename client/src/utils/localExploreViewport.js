import * as THREE from 'three'

export const LOCAL_EXPLORE_CAMERA_Z = 8
export const LOCAL_EXPLORE_CAMERA_FOV = 75
export const LOCAL_EXPLORE_VIEWPORT_PADDING = 0.9

/**
 * Visible half-width / half-height on the z=0 plane for the local explore camera.
 */
export const getLocalExploreViewportHalfExtents = (
  aspectRatio,
  padding = LOCAL_EXPLORE_VIEWPORT_PADDING
) => {
  const halfHeight = LOCAL_EXPLORE_CAMERA_Z * Math.tan((LOCAL_EXPLORE_CAMERA_FOV * Math.PI) / 360)
  const halfWidth = halfHeight * Math.max(aspectRatio, 0.1)
  return {
    halfWidth: halfWidth * padding,
    halfHeight: halfHeight * padding,
  }
}

const toVector3 = (value) => {
  if (value instanceof THREE.Vector3) return value.clone()
  if (Array.isArray(value)) return new THREE.Vector3(...value)
  return new THREE.Vector3(value.x, value.y, value.z)
}

/**
 * Uniform scale that fits (or fills) all node bounds inside the viewport.
 */
export const computeLocalExploreFitScale = (pointsWithRadii, center, halfWidth, halfHeight) => {
  if (!pointsWithRadii?.length) return 1

  const origin = toVector3(center)
  let maxNorm = 0

  pointsWithRadii.forEach(({ position, radius = 0 }) => {
    const point = toVector3(position)
    const offset = point.sub(origin)
    const normX = (Math.abs(offset.x) + radius) / halfWidth
    const normY = (Math.abs(offset.y) + radius) / halfHeight
    maxNorm = Math.max(maxNorm, normX, normY)
  })

  if (maxNorm < 1e-8) return 1
  return 1 / maxNorm
}

export const applyLocalExploreFit = (position, center, scale) => {
  const origin = toVector3(center)
  const point = toVector3(position)
  const offset = point.sub(origin).multiplyScalar(scale)
  return origin.clone().add(offset)
}
