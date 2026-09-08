import React from 'react'
import i18next from 'i18next'
const DangerfilesTest = () => {
  return (
    <div>
      <p>Untranslate eed String #1</p>
      <div placeholder="Untranttttslated String #2" />
      <p>{i18next.t('webpack.doc_page.src.App.Page.annotations.NoteEditor.NoteEditor.write')}</p>
    </div>
  )
}
export default DangerfilesTest
