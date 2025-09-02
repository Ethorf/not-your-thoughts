import { enumify } from '../utils/enumify'

export const SPHERE_TYPES = enumify(['main', 'connection'])

export const DEFAULT_SPHERE_SIZES = { [SPHERE_TYPES.MAIN]: 1.5, [SPHERE_TYPES.CONNECTION]: 0.8 }
