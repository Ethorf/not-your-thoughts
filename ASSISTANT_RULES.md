# Assistant Coding Rules & Guidelines

## 🚨 **CRITICAL PRE-CHANGE CHECKS**

### **1. Variable Management**

- [ ] **ALWAYS check for unused variables** before suggesting changes
- [ ] **Remove any variables that become unused** after modifications
- [ ] **Check for duplicate variable declarations** in the same scope
- [ ] **Verify all imported modules are actually used**
- [ ] **Clean up any leftover console.log statements**

### **2. Linting & Error Prevention**

- [ ] **Run linting checks** after each file modification
- [ ] **Fix all linting errors** before completing the task
- [ ] **Check for TypeScript/JavaScript syntax errors**
- [ ] **Verify all function parameters are used or prefixed with underscore**

### **3. Code Quality Standards**

- [ ] **Maintain consistent naming conventions**
- [ ] **Preserve existing code formatting and style**
- [ ] **Add comments for complex logic changes**
- [ ] **Ensure all functions have proper return types/values**

## 🔍 **CHANGE ANALYSIS WORKFLOW**

### **Before Making Changes:**

1. **Read the current file state** to understand existing code
2. **Identify all variables/imports** that will be affected
3. **Plan changes** to avoid creating unused variables
4. **Consider side effects** of the proposed changes

### **After Making Changes:**

1. **Scan for unused variables** in modified sections
2. **Run linter** on affected files
3. **Test that changes don't break existing functionality**
4. **Verify all imports are still needed**

## 📝 **SPECIFIC RULES BY LANGUAGE**

### **JavaScript/React:**

- [ ] Check for unused `import` statements
- [ ] Remove unused `const`, `let`, `var` declarations
- [ ] Clean up unused function parameters
- [ ] Remove unused React hooks or effects
- [ ] Check for unused props in components

### **Component Usage Rules:**

- [ ] **ALWAYS search for existing components before implementing new ones**
- [ ] **Use `codebase_search` tool to find similar components that already exist**
- [ ] **Check the `@components/Shared` directory for reusable components**
- [ ] **Only create new components when no suitable existing component is found**
- [ ] **Prefer adapting existing components over creating duplicates**
- [ ] **ALWAYS use custom components instead of basic semantic HTML tags**
- [ ] **Use `DefaultButton` instead of `<button>` tags**
- [ ] **Use `DefaultInput` instead of `<input>` tags**
- [ ] **Use `TextButton` instead of clickable text spans/divs**
- [ ] **Use `DefaultDropdown` instead of `<select>` tags**
- [ ] **Check for other custom components in `@components/Shared` before using native HTML elements**
- [ ] **When creating new components, prefer using existing custom components over basic HTML tags**
- [ ] **Only use basic HTML tags (`<div>`, `<span>`, `<p>`, etc.) when no custom component exists for that purpose**
- [ ] **ALWAYS use `SmallSpinner` component instead of plain text "Loading..." states**
- [ ] **Replace all loading text states with `<SmallSpinner />` component for consistent UI**
- [ ] **ALWAYS use Redux for API logic and state management when possible**
- [ ] **Create Redux async thunks for all API calls instead of using fetch/axios directly in components**
- [ ] **Store API response data in Redux state rather than component local state**
- [ ] **Use `useSelector` to read data from Redux instead of maintaining duplicate local state**
- [ ] **Only use local component state for UI-specific concerns (e.g., expanded/collapsed, form inputs)**

### **Tooltip Guidelines:**

- [ ] **Do NOT add tooltips to plain text elements** that would just repeat the same text
- [ ] **Do NOT add tooltips to static labels** or content without interactive functionality
- [ ] **Only add tooltips to**:
  - [ ] Buttons with functionality that needs explanation
  - [ ] Links with actions that require clarification
  - [ ] Interactive elements where the purpose isn't immediately clear
  - [ ] Icons or symbols that need context
- [ ] **Tooltips should provide additional context**, not repeat visible text
- [ ] **Example of what NOT to do**:
  ```jsx
  <div data-tooltip-id="main-tooltip" data-tooltip-content="word count">
    {wordCount} words
  </div>
  ```
- [ ] **Example of what TO do**:
  ```jsx
  <button
    data-tooltip-id="main-tooltip"
    data-tooltip-content="Click to export word count data"
    onClick={handleExport}
  >
    Export
  </button>
  ```

### **CSS/SCSS:**

- [ ] Remove unused class definitions
- [ ] Check for unused variable declarations
- [ ] Verify all imported mixins are used
- [ ] **NEVER add duplicate CSS rules** - always check if a rule already exists before adding it
- [ ] **Check for existing selectors** before adding new ones (e.g., if `.li` already exists, don't add it again)
- [ ] **Merge properties** into existing selectors instead of creating duplicates
- [ ] **Review the entire file** before adding new CSS rules to ensure no duplicates
- [ ] **If modifying styles, update existing rules** rather than adding duplicate selectors

### **General:**

- [ ] Remove commented-out code unless specifically requested to keep
- [ ] Clean up temporary debugging variables
- [ ] Remove unused utility functions

## 🛠 **REFACTORING GUIDELINES**

### **When Removing Functionality:**

- [ ] **Identify all related variables** that may become unused
- [ ] **Remove supporting code** that's no longer needed
- [ ] **Update imports** to remove unused dependencies
- [ ] **Clean up related comments** that no longer apply

### **When Adding Functionality:**

- [ ] **Only import what you need**
- [ ] **Use descriptive variable names**
- [ ] **Avoid creating variables that aren't used**
- [ ] **Group related functionality together**

## 🔄 **ITERATIVE IMPROVEMENT**

### **Multiple File Changes:**

- [ ] **Process one file at a time** completely before moving to next
- [ ] **Run linter after each file** rather than at the end
- [ ] **Check cross-file dependencies** when removing exports

### **Large Refactors:**

- [ ] **Break into smaller, focused changes**
- [ ] **Verify each step** before proceeding
- [ ] **Maintain working state** throughout the process

## 🎯 **SUCCESS CRITERIA**

### **Every Change Must:**

- [ ] **Pass all linting checks** without warnings
- [ ] **Have zero unused variables** in modified files
- [ ] **Maintain existing functionality** unless explicitly changing it
- [ ] **Follow project's existing patterns** and conventions

### **Before Declaring Task Complete:**

- [ ] **Run final linter check** on all modified files
- [ ] **Verify no console errors** in browser/terminal
- [ ] **Confirm all requested functionality** is working
- [ ] **Clean up any temporary debugging code**

## 📋 **QUICK CHECKLIST TEMPLATE**

For each code change:

```
□ Read current file state
□ Plan changes to avoid unused variables
□ Make modifications
□ Remove any newly unused variables
□ Run linter on modified files
□ Fix any linting errors
□ Verify functionality works
□ Clean up debugging code
```

## 🚫 **COMMON PITFALLS TO AVOID**

1. **Variable Redeclaration**: Creating duplicate `const`/`let` declarations
2. **Unused Imports**: Leaving imports after removing functionality
3. **Orphaned Variables**: Variables calculated but never used
4. **Dead Code**: Commented code or unreachable statements
5. **Inconsistent Patterns**: Not following existing code style

---

**Remember**: Clean, lint-free code is just as important as functional code!
