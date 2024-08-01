export const hasOneWord = (str) => {
  const trimmedStr = str.trim()

  const words = trimmedStr.split(/\s+/).filter((word) => word.length > 0)

  return words.length === 1
}
