import { enumify } from '../utils/enumify'

export const SPHERE_TYPES = enumify(['main', 'connection'])

export const DEFAULT_SPHERE_SIZES = { [SPHERE_TYPES.MAIN]: 1, [SPHERE_TYPES.CONNECTION]: 0.6 }

// Line width constants
export const LINE_WIDTHS = {
  MAIN_CONNECTION: 1.2,
  SUB_CONNECTION: 0.8,
}
