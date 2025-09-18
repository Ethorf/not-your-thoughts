import * as THREE from 'three'

// Constants
const SPHERE_DIAMETER = 0.5 * 2
const MIN_SEPARATION = SPHERE_DIAMETER + 0.1
const SIBLING_DISTANCE_FROM_CENTER_SPHERE = 0.5
const CHILD_DISTANCE_FROM_CENTER_SPHERE = SIBLING_DISTANCE_FROM_CENTER_SPHERE + 0.6
const PARENT_DISTANCE_FROM_CENTER_SPHERE = SIBLING_DISTANCE_FROM_CENTER_SPHERE + 0.7
const OUTER_FACTOR = 1.1

// Line extension factors
const LINE_EXTENSION_FACTOR = 1.5
const EXTERNAL_DISTANCE_FACTOR = 1.8 // Controls both external sphere distance and line length

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
    positions[s.id] = scaleFromOrigin([x, y, 0], OUTER_FACTOR)
  })

  // Position externals - closer to pointing directly up
  externals.forEach((e, i) => {
    const baseVerticalDistance = SPHERE_DIAMETER * 2.5 // Distance above center
    const horizontalOffset = (i % 2 === 0 ? -1 : 1) * SPHERE_DIAMETER * 0.8 // Small left/right offset
    const verticalOffset = Math.floor(i / 2) * SPHERE_DIAMETER * 0.6 // Stack vertically

    const x = horizontalOffset
    const y = baseVerticalDistance + verticalOffset

    positions[e.id] = [x, y, 0]
  })

  // Position parents
  parents.forEach((p, i) => {
    positions[p.id] = [0, SPHERE_DIAMETER + MIN_SEPARATION * PARENT_DISTANCE_FROM_CENTER_SPHERE, 0]
  })

  // Position children
  children.forEach((c, i) => {
    const x = (i - (children.length - 1) / 2) * MIN_SEPARATION
    const y = -2
    positions[c.id] = scaleFromOrigin([x, y, 0], CHILD_DISTANCE_FROM_CENTER_SPHERE)
  })

  return {
    positions,
    center: CENTER,
    lineExtensionFactor: LINE_EXTENSION_FACTOR,
    externalDistanceFactor: EXTERNAL_DISTANCE_FACTOR,
  }
}

export default calculateSpherePositions
