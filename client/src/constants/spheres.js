import { enumify } from '../utils/enumify'

export const SPHERE_TYPES = enumify([
  'main',
  'connection',
  'first_order_connection',
  'first_order_parent',
  'second_order_connection',
  'second_order_connection_max_size',
])

// Base/local (per-entry) view sphere sizes — main full size; connections slightly below legacy.
export const LOCAL_SPHERE_SIZES = {
  [SPHERE_TYPES.MAIN]: 1.2,
  [SPHERE_TYPES.FIRST_ORDER_CONNECTION]: 0.78,
  [SPHERE_TYPES.SECOND_ORDER_CONNECTION]: 0.6,
}

// Global (globe) view sphere sizes
export const GLOBAL_SPHERE_SIZES = {
  [SPHERE_TYPES.MAIN]: 0.36,
  [SPHERE_TYPES.FIRST_ORDER_CONNECTION]: 0.26,
  [SPHERE_TYPES.SECOND_ORDER_CONNECTION]: 0.2,
  [SPHERE_TYPES.FIRST_ORDER_PARENT]: 0.3,
  [SPHERE_TYPES.SECOND_ORDER_CONNECTION_MAX_SIZE]: 0.3,
}

/** Number of connections at which a non-main sphere reaches max (main) size */
export const GLOBAL_CONNECTIONS_FOR_MAX_SIZE = 10

/**
 * Scale non-main sphere size by connection count. More connections = larger sphere, up to main size.
 * @param {number} connectionCount - Number of connections the node has
 * @param {number} baseSize - Min size (from GLOBAL_SPHERE_SIZES for connection type)
 * @param {number} [maxSize] - Max size (defaults to GLOBAL_SPHERE_SIZES.MAIN)
 * @returns {number} Scaled size between baseSize and maxSize
 */
export const getGlobalConnectionSphereSize = (
  connectionCount,
  baseSize,
  maxSize = GLOBAL_SPHERE_SIZES[SPHERE_TYPES.SECOND_ORDER_CONNECTION_MAX_SIZE]
) => {
  if (connectionCount <= 0) return baseSize
  const t = Math.min(1, connectionCount / GLOBAL_CONNECTIONS_FOR_MAX_SIZE)
  return baseSize + (maxSize - baseSize) * t
}

// Base distance for first-order connection spheres in global view (minimum gap between sphere surfaces)
export const DEFAULT_CONNECTION_SPHERE_DISTANCE = 0.42

export const SECOND_ORDER_CONNECTION_SPHERE_DISTANCE = 0.12

export const SECOND_ORDER_SIBLING_CONNECTION_SPHERE_DISTANCE = 0.3

/**
 * Scale factor for size contribution to connection distance. Lower = tighter spacing.
 * Full radii (1.0) was too far; 0.3 adds modest spacing for larger spheres.
 */
export const SIZE_TO_DISTANCE_SCALE = 0.2

/**
 * Effective center-to-center distance so sphere surfaces don't overlap when larger.
 * Adds a scaled portion of both radii to avoid overlap without pushing nodes too far apart.
 * @param {number} baseDistance - Base gap between sphere centers
 * @param {number} sizeA - Radius of first sphere
 * @param {number} sizeB - Radius of second sphere
 * @returns {number} Effective distance between sphere centers
 */
export const getEffectiveConnectionDistance = (baseDistance, sizeA, sizeB) => {
  const sizeContribution = SIZE_TO_DISTANCE_SCALE * ((sizeA || 0) + (sizeB || 0))
  return baseDistance + sizeContribution
}

/** Radius of the center wireframe globe in Global View. Nodes are positioned at GLOBAL_NODE_SPHERE_RADIUS; this is purely visual. */
export const GLOBAL_CENTER_GLOBE_RADIUS = 2.2

/** Radius at which nodes are positioned on the globe in Global Explore. Higher = more space between clusters. */
export const GLOBAL_NODE_SPHERE_RADIUS = 3.5

/** Minimum distance between nodes for overlap prevention in Global View. Higher = more separation. */
export const GLOBAL_OVERLAP_MIN_DISTANCE = 0.5

/** Latitude band (degrees) for unconnected clusters. Further from equator = more separation from connected clusters. */
export const GLOBAL_UNCONNECTED_CLUSTER_LAT_MIN = 72
export const GLOBAL_UNCONNECTED_CLUSTER_LAT_MAX = 88

/** Minimum distance between cluster centers. Prevents clusters from overlapping when many exist. */
export const GLOBAL_MIN_CLUSTER_CENTER_DISTANCE = 1.3

// Backwards-compatible export – keep existing imports working.
// Treat the previous default as the local view sizes.
export const DEFAULT_SPHERE_SIZES = LOCAL_SPHERE_SIZES

// Local Explore view tuning constants
export const LOCAL_EXPLORE_CONNECTION_DISTANCE_SCALE = 1.08
export const LOCAL_EXPLORE_CONNECTION_SIZE_SCALE = 0.92
export const LOCAL_EXPLORE_MAIN_NODE_Y_OFFSET = 0
export const LOCAL_EXPLORE_CHILD_DISTANCE_SCALE = 1
export const LOCAL_EXPLORE_PARENT_DISTANCE_SCALE = 1
export const LOCAL_EXPLORE_SUB_ORBITAL_RADIUS_SCALE = 3.05
export const LOCAL_EXPLORE_SUB_CONNECTION_SIZE_SCALE = 0.7
export const LOCAL_EXPLORE_SUB_LAYOUT_BUFFER_SCALE = 0.9
// Max sub-connection depth from first-order nodes. 1 = second-order only (no third-order+).
export const LOCAL_EXPLORE_MAX_SUB_CONNECTION_DEPTH = 1

// Line width constants
export const LINE_WIDTHS = {
  MAIN_CONNECTION: 1.2,
  SUB_CONNECTION: 0.8,
}
