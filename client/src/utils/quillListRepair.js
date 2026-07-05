const LIST_ITEM_INDENT_CLASS_PREFIX = 'ql-indent-'
const ORDERED_LIST_NUMBER_ATTR = 'data-nyt-ol-num'

export const getListItemIndent = (element) => {
  const indentClass = [...element.classList].find((className) =>
    className.startsWith(LIST_ITEM_INDENT_CLASS_PREFIX)
  )

  if (!indentClass) {
    return 0
  }

  return parseInt(indentClass.slice(LIST_ITEM_INDENT_CLASS_PREFIX.length), 10) || 0
}

export const stripListItemIndent = (listItem) => {
  for (let level = 1; level <= 9; level += 1) {
    listItem.classList.remove(`${LIST_ITEM_INDENT_CLASS_PREFIX}${level}`)
  }
}

const isEmptyParagraph = (node) => {
  if (!node || node.tagName !== 'P') {
    return false
  }

  const text = node.textContent.replace(/\u200B/g, '').trim()
  return text === '' || node.innerHTML === '<br>' || node.innerHTML === '<br/>'
}

export const isTopLevelContentParagraph = (node) => {
  if (!node || node.tagName !== 'P' || isEmptyParagraph(node)) {
    return false
  }

  return getListItemIndent(node) === 0
}

const isListElement = (node) => node?.tagName === 'OL' || node?.tagName === 'UL'

export const isBulletListItem = (listItem) => {
  const listType = listItem.getAttribute('data-list')

  if (listType === 'bullet') {
    return true
  }

  if (listType === 'ordered') {
    return false
  }

  return listItem.parentElement?.tagName === 'UL'
}

const isContinuationOrderedList = (listElement) => {
  let previous = listElement.previousElementSibling

  while (previous && isEmptyParagraph(previous)) {
    previous = previous.previousElementSibling
  }

  return previous?.tagName === 'UL' || previous?.tagName === 'OL'
}

const shouldNumberAsTopLevelOrdered = (listItem, items, index, listElement) => {
  if (isBulletListItem(listItem)) {
    return false
  }

  const indent = getListItemIndent(listItem)

  if (indent === 0) {
    return true
  }

  if (index === 0 && isContinuationOrderedList(listElement)) {
    return true
  }

  const previous = index > 0 ? items[index - 1] : null
  if (!previous) {
    return false
  }

  if (getListItemIndent(previous) === 0) {
    return false
  }

  return items
    .slice(0, index)
    .some((item) => getListItemIndent(item) === 0 && !isBulletListItem(item))
}

const clearOrderedListNumber = (listItem) => {
  if (listItem.hasAttribute(ORDERED_LIST_NUMBER_ATTR)) {
    listItem.removeAttribute(ORDERED_LIST_NUMBER_ATTR)
    return true
  }

  return false
}

/**
 * Remove empty paragraphs sandwiched between lists (Quill reload artifact).
 */
export const removeEmptyParagraphsBetweenLists = (root) => {
  if (!root) {
    return false
  }

  let changed = false

  ;[...root.children].forEach((child) => {
    if (!isEmptyParagraph(child)) {
      return
    }

    const previous = child.previousElementSibling
    const next = child.nextElementSibling

    if (isListElement(previous) && isListElement(next)) {
      child.remove()
      changed = true
    }
  })

  return changed
}

/**
 * Outdent continuation ordered items that Quill leaves nested after bullet runs.
 */
export const fixContinuedTopLevelOrderedItems = (root) => {
  if (!root) {
    return false
  }

  let changed = false

  root.querySelectorAll('ol').forEach((listElement) => {
    const items = [...listElement.children].filter((child) => child.tagName === 'LI')

    items.forEach((listItem, index) => {
      if (!shouldNumberAsTopLevelOrdered(listItem, items, index, listElement)) {
        return
      }

      if (getListItemIndent(listItem) === 0) {
        return
      }

      stripListItemIndent(listItem)
      changed = true
    })
  })

  return changed
}

/**
 * Assign explicit ordered-list numbers so split <ol>/<ul> blocks and restarts
 * don't depend on fragile CSS counter scoping.
 */
export const assignOrderedListNumbers = (root) => {
  if (!root) {
    return false
  }

  let changed = false

  root.querySelectorAll(`li[${ORDERED_LIST_NUMBER_ATTR}]`).forEach((listItem) => {
    changed = clearOrderedListNumber(listItem) || changed
  })

  let counter = 0

  ;[...root.children].forEach((child) => {
    if (child.tagName === 'P' && isTopLevelContentParagraph(child)) {
      counter = 0
      return
    }

    if (child.tagName !== 'OL') {
      return
    }

    const items = [...child.children].filter((node) => node.tagName === 'LI')

    items.forEach((listItem, index) => {
      if (!shouldNumberAsTopLevelOrdered(listItem, items, index, child)) {
        return
      }

      counter += 1
      const nextValue = String(counter)

      if (listItem.getAttribute(ORDERED_LIST_NUMBER_ATTR) !== nextValue) {
        listItem.setAttribute(ORDERED_LIST_NUMBER_ATTR, nextValue)
        changed = true
      }
    })
  })

  return changed
}

export const repairQuillListStructure = (root) => {
  const removedGaps = removeEmptyParagraphsBetweenLists(root)
  const fixedIndents = fixContinuedTopLevelOrderedItems(root)

  return removedGaps || fixedIndents
}

export const refreshOrderedListDisplay = (root) => {
  const structuralChange = repairQuillListStructure(root)
  const numbersChanged = assignOrderedListNumbers(root)

  return structuralChange || numbersChanged
}
