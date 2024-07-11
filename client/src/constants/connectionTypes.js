import { enumify } from '../utils/enumify'

export const CONNECTION_TYPES = {
  FRONTEND: enumify(['parent', 'child', 'sibling', 'external']),
  BACKEND: enumify(['vertical', 'horizontal', 'external']),
}

const {
  FRONTEND: { SIBLING, CHILD, PARENT },
  BACKEND: { HORIZONTAL, VERTICAL },
} = CONNECTION_TYPES

export const FRONT_TO_BACK_CONN_TYPES = {
  [SIBLING]: HORIZONTAL,
  [CHILD]: VERTICAL,
  [PARENT]: VERTICAL,
}
