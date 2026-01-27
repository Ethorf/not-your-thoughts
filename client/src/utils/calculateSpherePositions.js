import * as THREE from 'three'

// Constants
const SPHERE_DIAMETER = 0.5 * 2
const MIN_SEPARATION = SPHERE_DIAMETER + 0.1
const SIBLING_DISTANCE_FROM_CENTER_SPHERE = 0.5
const CHILD_DISTANCE_FROM_CENTER_SPHERE = SIBLING_DISTANCE_FROM_CENTER_SPHERE + 0.6
const PARENT_DISTANCE_FROM_CENTER_SPHERE = SIBLING_DISTANCE_FROM_CENTER_SPHERE + 0.7
const OUTER_FACTOR = 1.1
const HORIZONTAL_ROTATION = {
  [-1]: 5,
  1: 4.4,
}
// Line extension factors
// These control how far connection spheres (and their lines) sit from the main sphere.
// With larger local sphere sizes, we push connections further out to keep lines from overlapping.
const LINE_EXTENSION_FACTOR = 2.4
const EXTERNAL_DISTANCE_FACTOR = 2.9 // Controls both external sphere distance and line length

// Center point
const CENTER = [0, 0, 0]

/**
 * Calculates 3D positions for connection spheres and returns positioning configuration
 * @param {Array} connections - Array of connection objects with connection_type property
 * @param {Object} connectionTypes - Object containing connection type constants
 * @returns {Object} - Object containing positions, center point, and line extension factors
 */
const calculateSpherePositions = (connections, connectionTypes) => {
  const { PARENT, EXTERNAL, CHILD, SIBLING } = connectionTypes
  const positions = {}
  const horizontalRotation = {}
  const verticalRotation = {}
  const subConnectionVerticalOffset = {}
  const subConnectionHorizontalOffset = {}

  // Helper function to scale position from origin
  const scaleFromOrigin = (pos, factor) => {
    const v = new THREE.Vector3(...pos)
    return v.multiplyScalar(factor).toArray()
  }

  // Filter connections by type
  const siblings = connections?.filter((c) => c.connection_type === SIBLING) || []
  const parents = connections?.filter((c) => c.connection_type === PARENT) || []
  const children = connections?.filter((c) => c.connection_type === CHILD) || []
  const externals = connections?.filter((c) => c.connection_type === EXTERNAL) || []

  // Position siblings
  siblings.forEach((s, i) => {
    // Alternate left and right sides
    const side = i % 2 === 0 ? -1 : 1
    const x = side * (SPHERE_DIAMETER + SIBLING_DISTANCE_FROM_CENTER_SPHERE)
    const y = Math.floor(i / 2) * MIN_SEPARATION * (i % 2 === 0 ? 1 : -1)

    // Set horizontal rotation based on side
    horizontalRotation[s.id] = HORIZONTAL_ROTATION[side]

    // Siblings are at the same level as center, no vertical rotation
    verticalRotation[s.id] = 0

    // Siblings can have sub-connections above or below (default behavior)
    subConnectionVerticalOffset[s.id] = 0
    subConnectionHorizontalOffset[s.id] = 0

    positions[s.id] = scaleFromOrigin([x, y, 0], OUTER_FACTOR)
  })

  // Position externals - closer to pointing directly up
  externals.forEach((e, i) => {
    const baseVerticalDistance = SPHERE_DIAMETER * 2.5 // Distance above center
    const horizontalOffset = (i % 2 === 0 ? -1 : 1) * SPHERE_DIAMETER * 0.8 // Small left/right offset
    const verticalOffset = Math.floor(i / 2) * SPHERE_DIAMETER * 0.6 // Stack vertically

    const x = horizontalOffset
    const y = baseVerticalDistance + verticalOffset

    // Set horizontal rotation based on side for externals
    const side = i % 2 === 0 ? -1 : 1
    horizontalRotation[e.id] = HORIZONTAL_ROTATION[side]

    // Externals are above center, positive vertical rotation
    verticalRotation[e.id] = 0.3

    // Externals can have sub-connections above or below (default behavior)
    subConnectionVerticalOffset[e.id] = 0
    subConnectionHorizontalOffset[e.id] = 0

    positions[e.id] = [x, y, 0]
  })

  // Position parents
  parents.forEach((p, i) => {
    // Parents are above center, use default rotation
    horizontalRotation[p.id] = 4.7

    // Parents are above center, positive vertical rotation
    verticalRotation[p.id] = 0.3

    // Parent sub-connections should appear below the parent sphere, alternating left and right
    subConnectionVerticalOffset[p.id] = -1.5 // Negative offset to place sub-connections below
    subConnectionHorizontalOffset[p.id] = i % 2 === 0 ? -1.2 : 1.2 // Alternate left (-1.2) and right (1.2)

    positions[p.id] = [0, SPHERE_DIAMETER + MIN_SEPARATION * PARENT_DISTANCE_FROM_CENTER_SPHERE, 0]
  })

  // Position children
  children.forEach((c, i) => {
    const x = (i - (children.length - 1) / 2) * MIN_SEPARATION
    const y = -2

    // Children below center, use default rotation
    horizontalRotation[c.id] = 4.7

    // Children are below center, negative vertical rotation
    verticalRotation[c.id] = -0.3

    // Children can have sub-connections above or below (default behavior)
    subConnectionVerticalOffset[c.id] = 0
    subConnectionHorizontalOffset[c.id] = 0

    positions[c.id] = scaleFromOrigin([x, y, 0], CHILD_DISTANCE_FROM_CENTER_SPHERE)
  })

  // Ensure all connections have rotation values (default case)
  connections?.forEach((conn) => {
    if (!horizontalRotation[conn.id]) {
      horizontalRotation[conn.id] = 4.7 // Default horizontal rotation
    }
    if (!verticalRotation[conn.id]) {
      verticalRotation[conn.id] = 0 // Default vertical rotation
    }
    if (!subConnectionVerticalOffset[conn.id]) {
      subConnectionVerticalOffset[conn.id] = 0 // Default vertical offset for sub-connections
    }
    if (!subConnectionHorizontalOffset[conn.id]) {
      subConnectionHorizontalOffset[conn.id] = 0 // Default horizontal offset for sub-connections
    }
  })

  return {
    positions,
    horizontalRotation,
    verticalRotation,
    subConnectionVerticalOffset,
    subConnectionHorizontalOffset,
    center: CENTER,
    lineExtensionFactor: LINE_EXTENSION_FACTOR,
    externalDistanceFactor: EXTERNAL_DISTANCE_FACTOR,
  }
}

export default calculateSpherePositions
