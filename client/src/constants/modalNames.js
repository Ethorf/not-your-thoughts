import { enumify } from '../utils/enumify'

export const MODAL_NAMES = enumify([
  'custom_prompts',
  'success',
  'journal_content',
  'node_content',
  'akas_input',
  'connections',
  'are_you_sure',
  'node_settings',
  // Public modals
  'public_history',
  'public_connections',
  'public_legend',
])
