function extractValidJsString(str) {
  // Define a regular expression to match a string preceded by '"', '>', '`', or "'", but not "import"
  const regex = /(?<!import.*)[">'`](.*?)(?=[">'`]|$)/

  const match = regex.exec(str)
  if (match) {
    return match[1].trim() // Extract and trim the matched part
  }

  return null
}

function isUntranslatedString(str) {
  if (!str) return false

  const regex = /i18next\.t\(['"](.*)['"]\)/i

  return !regex.test(str)
}

// console.log(isUntranslatedString(extractValidJsString(`<div placeholder="Untranttttslated String #2" />`)))
// console.log(
//   isUntranslatedString(
//     extractValidJsString(`<p>{i18next.t('webpack.doc_page.src.App.Page.annotations.NoteEditor.NoteEditor.write')}</p>`)
//   )
// )

// console.log(
//   isUntranslatedString(`<p>{i18next.t('webpack.doc_page.src.App.Page.annotations.NoteEditor.NoteEditor.write')}</p>`)
// )
// console.log(isUntranslatedString("import React from 'react'"))

// console.log(extractValidJsString("import React from 'react'"))

console.log(isUntranslatedString(extractValidJsString(`import React from 'react'`)))
console.log(isUntranslatedString(extractValidJsString(`<div placeholder="Untranttttslated String #2" />`)))
console.log(
  //   isUntranslatedString(
  extractValidJsString(`<p>{i18next.t('webpack.doc_page.src.App.Page.annotations.NoteEditor.NoteEditor.write')}</p>`)
  //   )
)
