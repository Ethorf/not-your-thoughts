export const toNonNegativeInt = (value) => Math.max(0, Math.floor(Number(value) || 0))

export const normalizeWritingStats = (stats = {}) => ({
  allEntriesTotalWritingTime: toNonNegativeInt(stats.allEntriesTotalWritingTime),
  allEntriesWritingTimeToday: toNonNegativeInt(stats.allEntriesWritingTimeToday),
  allEntriesTotalWordCount: toNonNegativeInt(stats.allEntriesTotalWordCount),
  allEntriesWordCountToday: toNonNegativeInt(stats.allEntriesWordCountToday),
  nodesTotalWritingTime: toNonNegativeInt(stats.nodesTotalWritingTime),
  nodesWritingTimeToday: toNonNegativeInt(stats.nodesWritingTimeToday),
  nodesTotalWordCount: toNonNegativeInt(stats.nodesTotalWordCount),
  nodesWordCountToday: toNonNegativeInt(stats.nodesWordCountToday),
  journalsTotalWritingTime: toNonNegativeInt(stats.journalsTotalWritingTime),
  journalWritingTimeToday: toNonNegativeInt(stats.journalWritingTimeToday),
  journalsTotalWordCount: toNonNegativeInt(stats.journalsTotalWordCount),
  journalWordCountToday: toNonNegativeInt(stats.journalWordCountToday),
})
