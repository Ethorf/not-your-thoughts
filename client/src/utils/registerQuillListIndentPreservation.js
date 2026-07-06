import Quill from 'quill'

import { getListItemIndent } from '@utils/quillListRepair'

const Parchment = Quill.import('parchment')
const BaseListItem = Quill.import('formats/list/item')
const List = Quill.import('formats/list')
const Indent = Quill.import('formats/indent')

class ListItemPreserveIndent extends BaseListItem {
  format(name, value) {
    if (name === List.blotName && !value) {
      const indent = getListItemIndent(this.domNode) || Indent.value(this.domNode) || this.formats().indent
      const replacement = Parchment.create(this.statics.scope)

      this.replaceWith(replacement)

      if (indent) {
        replacement.format('indent', indent)
      }

      return
    }

    super.format(name, value)
  }
}

let hasRegisteredListIndentPreservation = false

export const registerQuillListIndentPreservation = () => {
  if (hasRegisteredListIndentPreservation) {
    return
  }

  Quill.register('formats/list/item', ListItemPreserveIndent, true)
  hasRegisteredListIndentPreservation = true
}
