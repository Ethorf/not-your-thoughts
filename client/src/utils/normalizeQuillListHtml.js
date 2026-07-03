const LIST_ITEM_INDENT_CLASS_PREFIX = 'ql-indent-'

const getIndentLevelFromElement = (element) => {
  const indentClass = [...element.classList].find((className) =>
    className.startsWith(LIST_ITEM_INDENT_CLASS_PREFIX)
  )

  if (!indentClass) {
    return 0
  }

  return parseInt(indentClass.slice(LIST_ITEM_INDENT_CLASS_PREFIX.length), 10) || 0
}

const getListTypeForContainer = (listElement) => {
  if (listElement.tagName === 'UL') {
    return 'bullet'
  }

  return 'ordered'
}

const setListItemIndent = (listItem, indentLevel) => {
  for (let level = 1; level <= 9; level += 1) {
    listItem.classList.remove(`${LIST_ITEM_INDENT_CLASS_PREFIX}${level}`)
  }

  if (indentLevel > 0) {
    listItem.classList.add(`${LIST_ITEM_INDENT_CLASS_PREFIX}${indentLevel}`)
  }
}

const isEmptyGapNode = (node) => {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) {
    return false
  }

  if (node.tagName === 'P') {
    const text = node.textContent.replace(/\u200B/g, '').trim()
    return text === '' || node.innerHTML === '<br>'
  }

  return false
}

const hoistNestedListItems = (listItem, indentLevel) => {
  const parentList = listItem.parentElement
  if (!parentList) {
    return
  }

  const nestedLists = [...listItem.children].filter(
    (child) => child.tagName === 'OL' || child.tagName === 'UL'
  )

  nestedLists.forEach((nestedList) => {
    const listType = getListTypeForContainer(nestedList)
    const nestedItems = [...nestedList.children].filter((child) => child.tagName === 'LI')
    let insertAfter = listItem

    nestedItems.forEach((nestedItem) => {
      const childIndent = indentLevel + 1
      setListItemIndent(nestedItem, childIndent)

      if (!nestedItem.hasAttribute('data-list')) {
        nestedItem.setAttribute('data-list', listType)
      }

      hoistNestedListItems(nestedItem, childIndent)
      insertAfter.insertAdjacentElement('afterend', nestedItem)
      insertAfter = nestedItem
    })

    nestedList.remove()
  })
}

const convertTopLevelListsToOrderedContainer = (root) => {
  root.querySelectorAll('ul').forEach((listElement) => {
    if (listElement.tagName !== 'UL') {
      return
    }

    const orderedList = document.createElement('ol')
    orderedList.innerHTML = listElement.innerHTML
    orderedList.querySelectorAll('li').forEach((listItem) => {
      if (!listItem.hasAttribute('data-list')) {
        listItem.setAttribute('data-list', 'bullet')
      }
    })

    listElement.replaceWith(orderedList)
  })
}

const inferListTypeFromList = (listElement) => {
  const listItems = [...listElement.querySelectorAll(':scope > li')]
  const bulletItem = listItems.find((item) => item.getAttribute('data-list') === 'bullet')

  if (bulletItem) {
    return 'bullet'
  }

  return 'ordered'
}

const promoteParagraphsBetweenLists = (root) => {
  let changed = true

  while (changed) {
    changed = false
    const children = [...root.children]

    for (let index = 1; index < children.length - 1; index += 1) {
      const paragraph = children[index]
      const previous = children[index - 1]
      const next = children[index + 1]

      if (paragraph.tagName !== 'P' || previous.tagName !== 'OL' || next.tagName !== 'OL') {
        continue
      }

      const listItem = document.createElement('li')
      listItem.className = paragraph.className
      listItem.innerHTML = paragraph.innerHTML

      const indentLevel = getIndentLevelFromElement(listItem)
      if (!listItem.hasAttribute('data-list')) {
        listItem.setAttribute(
          'data-list',
          indentLevel > 0 ? inferListTypeFromList(previous) : 'ordered'
        )
      }

      previous.appendChild(listItem)
      paragraph.remove()

      while (next.firstChild) {
        previous.appendChild(next.firstChild)
      }
      next.remove()
      changed = true
      break
    }
  }
}

const mergeAdjacentOrderedLists = (root) => {
  let changed = true

  while (changed) {
    changed = false
    const children = [...root.children]

    for (let index = 0; index < children.length; index += 1) {
      const list = children[index]
      if (list.tagName !== 'OL') {
        continue
      }

      let nextIndex = index + 1
      while (nextIndex < children.length && isEmptyGapNode(children[nextIndex])) {
        children[nextIndex].remove()
        nextIndex += 1
      }

      if (nextIndex >= children.length || children[nextIndex].tagName !== 'OL') {
        continue
      }

      const nextList = children[nextIndex]
      while (nextList.firstChild) {
        list.appendChild(nextList.firstChild)
      }
      nextList.remove()
      changed = true
      break
    }
  }
}

const getListItemType = (listItem) => listItem.getAttribute('data-list') || 'ordered'

/**
 * After nested bullets, Quill often leaves the next main ordered item at ql-indent-1.
 * That makes it use the indent-1 counter (showing "1.") instead of the top-level sequence.
 */
const getListRoots = (root) => {
  if (!root) {
    return []
  }

  if (root.tagName === 'OL') {
    return [root]
  }

  return [...root.querySelectorAll('ol')]
}

export const fixContinuedTopLevelOrderedItems = (root) => {
  let changed = false

  getListRoots(root).forEach((listElement) => {
    const items = [...listElement.children].filter((child) => child.tagName === 'LI')

    items.forEach((listItem, index) => {
      const indent = getIndentLevelFromElement(listItem)
      if (indent === 0 || getListItemType(listItem) !== 'ordered') {
        return
      }

      const previous = index > 0 ? items[index - 1] : null
      if (!previous) {
        return
      }

      const previousIndent = getIndentLevelFromElement(previous)
      const previousType = getListItemType(previous)

      // Legitimate nested ordered sub-list directly under a parent ordered item.
      if (previousType === 'ordered' && previousIndent < indent) {
        return
      }

      const followsNestedContent =
        previousType === 'bullet' || (previousIndent > 0 && previousType !== 'ordered')

      if (!followsNestedContent) {
        return
      }

      let hasTopLevelOrderedBefore = false
      for (let scanIndex = index - 1; scanIndex >= 0; scanIndex -= 1) {
        const scannedItem = items[scanIndex]
        const scannedIndent = getIndentLevelFromElement(scannedItem)
        const scannedType = getListItemType(scannedItem)

        if (scannedIndent === 0 && scannedType === 'ordered') {
          hasTopLevelOrderedBefore = true
          break
        }
      }

      if (!hasTopLevelOrderedBefore) {
        return
      }

      setListItemIndent(listItem, 0)
      changed = true
    })
  })

  return changed
}

const normalizeListItems = (root) => {
  root.querySelectorAll('ol > li').forEach((listItem) => {
    if (!listItem.hasAttribute('data-list')) {
      listItem.setAttribute('data-list', 'ordered')
    }

    const indentLevel = getIndentLevelFromElement(listItem)
    hoistNestedListItems(listItem, indentLevel)
  })
}

/**
 * Quill nested lists use one flat OL with per-line data-list + ql-indent.
 * Nested OL/UL markup or split lists break numbering and load behavior.
 */
export const normalizeQuillListHtml = (html) => {
  if (!html || typeof document === 'undefined') {
    return html || ''
  }

  const template = document.createElement('div')
  template.innerHTML = html

  convertTopLevelListsToOrderedContainer(template)
  normalizeListItems(template)
  promoteParagraphsBetweenLists(template)
  mergeAdjacentOrderedLists(template)
  fixContinuedTopLevelOrderedItems(template)

  return template.innerHTML
}

const promoteParagraphsBetweenListsInDom = (root) => {
  let changed = false

  while (true) {
    const children = [...root.children]
    let merged = false

    for (let index = 1; index < children.length - 1; index += 1) {
      const paragraph = children[index]
      const previous = children[index - 1]
      const next = children[index + 1]

      if (paragraph.tagName !== 'P' || previous.tagName !== 'OL' || next.tagName !== 'OL') {
        continue
      }

      const listItem = document.createElement('li')
      listItem.className = paragraph.className
      listItem.innerHTML = paragraph.innerHTML

      const indentLevel = getIndentLevelFromElement(listItem)
      if (!listItem.hasAttribute('data-list')) {
        listItem.setAttribute(
          'data-list',
          indentLevel > 0 ? inferListTypeFromList(previous) : 'ordered'
        )
      }

      previous.appendChild(listItem)
      paragraph.remove()

      while (next.firstChild) {
        previous.appendChild(next.firstChild)
      }
      next.remove()

      merged = true
      changed = true
      break
    }

    if (!merged) {
      break
    }
  }

  return changed
}

const mergeAdjacentOrderedListsInDomInternal = (root) => {
  let changed = false

  while (true) {
    const children = [...root.children]
    let merged = false

    for (let index = 0; index < children.length; index += 1) {
      const list = children[index]
      if (list.tagName !== 'OL') {
        continue
      }

      let nextIndex = index + 1
      while (nextIndex < children.length && isEmptyGapNode(children[nextIndex])) {
        children[nextIndex].remove()
        nextIndex += 1
      }

      if (nextIndex >= children.length || children[nextIndex].tagName !== 'OL') {
        continue
      }

      const nextList = children[nextIndex]
      while (nextList.firstChild) {
        list.appendChild(nextList.firstChild)
      }
      nextList.remove()
      merged = true
      changed = true
      break
    }

    if (!merged) {
      break
    }
  }

  return changed
}

/**
 * Merge split OL blocks in the live editor DOM so top-level numbering stays continuous.
 */
export const mergeAdjacentOrderedListsInDom = (root) => {
  if (!root) {
    return false
  }

  const promoted = promoteParagraphsBetweenListsInDom(root)
  const merged = mergeAdjacentOrderedListsInDomInternal(root)
  const fixedIndents = fixContinuedTopLevelOrderedItems(root)

  return promoted || merged || fixedIndents
}
