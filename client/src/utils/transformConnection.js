import { CONNECTION_TYPES } from '@constants/connectionTypes'

export const transformConnection = (currentEntryId, conn) => {
  if (!conn) return

  if (conn.connection_type === CONNECTION_TYPES.FRONTEND.EXTERNAL) {
    return { title: conn.primary_source, id: conn.primary_entry_id }
  }

  return currentEntryId === conn.foreign_entry_id
    ? { title: conn.primary_entry_title, id: conn.primary_entry_id }
    : { title: conn.foreign_entry_title, id: conn.foreign_entry_id }
}
