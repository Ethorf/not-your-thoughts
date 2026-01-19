import { enumify } from '../utils/enumify'

export const SPHERE_TYPES = enumify(['main', 'connection', 'first_order_connection', 'second_order_connection'])

export const DEFAULT_SPHERE_SIZES = { [SPHERE_TYPES.MAIN]: 0.35, [SPHERE_TYPES.FIRST_ORDER_CONNECTION]: 0.25, [SPHERE_TYPES.SECOND_ORDER_CONNECTION]: 0.23   }
// jeff
// Line width constants
export const LINE_WIDTHS = {
  MAIN_CONNECTION: 1.2,
  SUB_CONNECTION: 0.8,
}
