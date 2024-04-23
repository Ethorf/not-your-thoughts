const parseSqlArr = (sqlArr) => {
  return sqlArr
    .substring(1, sqlArr.length - 1)
    .split(',')
    .map((item, index) =>
      index === 0 ? item.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"') : item.replace(/^"(.*)"$/, '$1')
    )
}

module.exports = parseSqlArr
