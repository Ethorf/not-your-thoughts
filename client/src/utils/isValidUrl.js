export const isValidUrl = (string) => {
  if (!string) {
    return false // The string is null or empty
  }

  try {
    new URL(string)
    return true
  } catch (err) {
    return false
  }
}
