export const enumify = (values) => {
  const output = {}

  values?.forEach((v) => (output[v.replace(/\-/g, '_').toUpperCase()] = v))

  return output
}
