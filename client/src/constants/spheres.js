import { enumify } from '../utils/enumify'

export const SPHERE_TYPES = enumify(['main', 'connection', 'first_order_connection', 'second_order_connection'])

// Base/local (per-entry) view sphere sizes
export const LOCAL_SPHERE_SIZES = {
  [SPHERE_TYPES.MAIN]: 1.3,
  [SPHERE_TYPES.FIRST_ORDER_CONNECTION]: 0.9,
  [SPHERE_TYPES.SECOND_ORDER_CONNECTION]: 0.7,
}

// Global (globe) view sphere sizes
export const GLOBAL_SPHERE_SIZES = {
  [SPHERE_TYPES.MAIN]: 0.36,
  [SPHERE_TYPES.FIRST_ORDER_CONNECTION]: 0.26,
  [SPHERE_TYPES.SECOND_ORDER_CONNECTION]: 0.2,
}

// Default distance for first-order connection spheres in global view
export const DEFAULT_CONNECTION_SPHERE_DISTANCE = 0.35

// Backwards-compatible export – keep existing imports working.
// Treat the previous default as the local view sizes.
export const DEFAULT_SPHERE_SIZES = LOCAL_SPHERE_SIZES
// jeff
// Line width constants
export const LINE_WIDTHS = {
  MAIN_CONNECTION: 1.2,
  SUB_CONNECTION: 0.8,
}
