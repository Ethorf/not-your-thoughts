import { enumify } from '../utils/enumify'

export const CONNECTION_TYPES = {
  BACKEND: enumify(['vertical', 'horizontal']),
  FRONTEND: enumify(['parent', 'child', 'sibling']),
}

const {
  FRONTEND: { SIBLING, CHILD, PARENT },
  BACKEND: { HORIZONTAL, VERTICAL },
} = CONNECTION_TYPES

const FRONT_TO_BACK_CONN_TYPES = {
  [SIBLING]: HORIZONTAL,
  [CHILD]: VERTICAL,
  [PARENT]: VERTICAL,
}
