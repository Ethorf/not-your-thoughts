import { CONNECTION_TYPES } from '@constants/connectionTypes'

export const transformConnection = (currentEntryId, conn) => {
  if (!conn) return { title: 'Unknown', id: null }

  if (conn.connection_type === CONNECTION_TYPES.FRONTEND.EXTERNAL) {
    return { title: conn.primary_source || 'External Link', id: conn.primary_entry_id || null }
  }

  return currentEntryId === conn.foreign_entry_id
    ? { title: conn.primary_entry_title || 'Untitled', id: conn.primary_entry_id || null }
    : { title: conn.foreign_entry_title || 'Untitled', id: conn.foreign_entry_id || null }
}
