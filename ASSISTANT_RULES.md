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

### **CSS/SCSS:**

- [ ] Remove unused class definitions
- [ ] Check for unused variable declarations
- [ ] Verify all imported mixins are used

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
