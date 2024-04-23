import { enumify } from '../utils/enumify'
import { ENTRY_TYPES } from './entryTypes'

export const ENTRY_SORT_OPTIONS = {
  [ENTRY_TYPES.JOURNAL]: enumify(['custom_prompts', 'success', 'journal_content', 'node_content']),
  [ENTRY_TYPES.NODE]: enumify(
    'Most Words',
    'Least Words',
    'Longest Time',
    'Shortest Time',
    'Fastest WPM',
    'Slowest WPM',
    'Oldest First',
    'Newest First'
  ),
}
