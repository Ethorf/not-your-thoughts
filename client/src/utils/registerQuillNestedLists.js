import Quill from 'quill'
import { fixContinuedTopLevelOrderedItems } from './normalizeQuillListHtml'

const ListItem = Quill.import('formats/list/item')
const ListContainer = Quill.import('formats/list')
const IndentClass = Quill.import('formats/indent')
const Parchment = Quill.import('parchment')

const LIST_ITEM_BLOT_NAME = 'list-item'

const getIndentLevel = (domNode) => IndentClass.value(domNode) || 0

const getListType = (domNode) => domNode.getAttribute('data-list') || 'ordered'

const isListItemBlot = (blot) => blot?.statics?.blotName === LIST_ITEM_BLOT_NAME

const findListTypeAtIndent = (listItemBlot, targetIndent) => {
  let sibling = listItemBlot.prev
  while (sibling) {
    if (isListItemBlot(sibling) && getIndentLevel(sibling.domNode) === targetIndent) {
      return getListType(sibling.domNode)
    }
    sibling = sibling.prev
  }

  sibling = listItemBlot.next
  while (sibling) {
    if (isListItemBlot(sibling) && getIndentLevel(sibling.domNode) === targetIndent) {
      return getListType(sibling.domNode)
    }
    sibling = sibling.next
  }

  return targetIndent === 0 ? 'ordered' : null
}

/**
 * Quill's default list model splits ordered/unordered into separate OL/UL blocks.
 * These formats keep one OL container and store each line's list type on data-list,
 * which enables nested bullets under ordered items (and vice versa).
 */
class NestedListItem extends ListItem {
  static create(value) {
    const node = super.create()
    if (value) {
      node.setAttribute('data-list', value)
    }
    return node
  }

  static formats(domNode) {
    return domNode.getAttribute('data-list') || undefined
  }

  format(name, value) {
    if (name === 'indent') {
      const previousIndent = getIndentLevel(this.domNode)

      super.format(name, value)

      const nextIndent = getIndentLevel(this.domNode)
      if (nextIndent < previousIndent) {
        const resolvedType = findListTypeAtIndent(this, nextIndent)
        if (resolvedType) {
          this.domNode.setAttribute('data-list', resolvedType)
        }
      }

      this.cache = {}
      return
    }

    if (name === 'list') {
      if (value) {
        this.domNode.setAttribute('data-list', value)
        this.cache = {}
        return
      }

      const preservedIndent = getIndentLevel(this.domNode)
      this.domNode.removeAttribute('data-list')

      const replacement = this.replaceWith(Parchment.create(this.statics.scope))

      if (preservedIndent > 0 && replacement) {
        IndentClass.add(replacement.domNode, preservedIndent)
        replacement.cache = {}
      }

      return
    }

    super.format(name, value)
  }

  formats() {
    const formats = super.formats()
    const listType = this.domNode.getAttribute('data-list') || 'ordered'

    delete formats['list-item']
    formats.list = listType

    return formats
  }

  optimize(context) {
    super.optimize(context)

    if (this.scroll?.domNode) {
      fixContinuedTopLevelOrderedItems(this.scroll.domNode)
    }
  }
}

class NestedListContainer extends ListContainer {
  static create() {
    return document.createElement('ol')
  }

  static formats(domNode) {
    if (domNode?.tagName === 'OL') {
      return 'ordered'
    }

    if (domNode?.tagName === 'UL') {
      if (domNode.hasAttribute('data-checked')) {
        return domNode.getAttribute('data-checked') === 'true' ? 'checked' : 'unchecked'
      }

      return 'bullet'
    }

    return undefined
  }

  formats() {
    return {}
  }

  optimize(context) {
    super.optimize(context)

    const next = this.next
    if (
      next != null &&
      next.statics?.blotName === this.statics.blotName &&
      next.domNode.tagName === this.domNode.tagName
    ) {
      next.moveChildren(this)
      next.remove()
    }
  }
}

export const quillKeyboardBindings = {
  // Quill's default Tab binding always inserts "\t". Override it so line-start Tab
  // indents plain paragraphs while list/blockquote lines still use the indent binding.
  tab: {
    key: 9,
    handler: function handleTabKey(range, context) {
      if (!context.collapsed || context.offset !== 0) {
        this.quill.history.cutoff()
        const Delta = Quill.import('delta')
        const delta = new Delta().retain(range.index).delete(range.length).insert('\t')
        this.quill.updateContents(delta, Quill.sources.USER)
        this.quill.history.cutoff()
        this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
        return false
      }

      if (context.format.list || context.format.blockquote) {
        return true
      }

      this.quill.format('indent', '+1', Quill.sources.USER)
      return false
    },
  },
}

let hasRegisteredNestedLists = false

export const registerQuillNestedLists = () => {
  if (hasRegisteredNestedLists) {
    return
  }

  Quill.register(NestedListContainer, true)
  Quill.register(NestedListItem, true)
  hasRegisteredNestedLists = true
}
