export const parseDate = (dateString) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1 // Months are zero-based, so we add 1
  const day = date.getDate()
  const year = date.getFullYear()

  // Pad single digits with leading zero
  const formattedMonth = month < 10 ? '0' + month : month
  const formattedDay = day < 10 ? '0' + day : day

  return `${formattedMonth}/${formattedDay}/${year}`
}
