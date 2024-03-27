// Function to format time in m:ss format
export const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
