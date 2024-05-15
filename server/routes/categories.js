const express = require('express')
const router = express.Router()
const pool = require('../config/neonDb')
const authorize = require('../middleware/authorize')

// Route to retrieve all categories
router.get('/', authorize, async (req, res) => {
  try {
    // Retrieve all categories
    const allCategories = await pool.query('SELECT * FROM categories')

    // Check if there are any categories found
    if (allCategories.rows.length === 0) {
      return res.status(404).json({ msg: 'No categories found' })
    }

    // Iterate through each category to populate parent_category and child_categories
    for (let i = 0; i < allCategories.rows.length; i++) {
      const category = allCategories.rows[i]
      if (category.parent_category) {
        // Retrieve the corresponding parent category from categories table
        const parentCategory = await pool.query('SELECT * FROM categories WHERE id = $1', [category.parent_category])

        // If parent category is found, populate parent_category in category object
        if (parentCategory.rows.length > 0) {
          category.parent_category = parentCategory.rows[0]
        }
      }

      if (category.child_categories && category.child_categories.length > 0) {
        // Retrieve the corresponding child categories from categories table
        const childCategories = await pool.query('SELECT * FROM categories WHERE id = ANY($1)', [
          category.child_categories,
        ])

        // If child categories are found, populate child_categories in category object
        if (childCategories.rows.length > 0) {
          category.child_categories = childCategories.rows
        }
      }
    }

    // If categories are found, return them
    res.json({ categories: allCategories.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to retrieve a single category by ID
router.get('/:category_id', authorize, async (req, res) => {
  const { category_id } = req.params

  try {
    // Retrieve the category by ID
    const category = await pool.query('SELECT * FROM categories WHERE id = $1', [category_id])

    // Check if the category is found
    if (category.rows.length === 0) {
      return res.status(404).json({ msg: 'Category not found' })
    }

    // If category is found, return it
    res.json({ category: category.rows[0] })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to create a new category
router.post('/create_category', authorize, async (req, res) => {
  const { name } = req.body
  const lowercaseName = name.toLowerCase() // Convert name to lowercase

  try {
    // Check if the category already exists
    const existingCategory = await pool.query('SELECT * FROM categories WHERE LOWER(name) = $1', [lowercaseName])
    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ msg: 'Category already exists' })
    }

    // Insert the new category
    const newCategory = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [lowercaseName])
    res.json(newCategory.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to update the parent category of a child category and vice versa
router.put('/parent_category/:child_category_id', authorize, async (req, res) => {
  const { child_category_id } = req.params
  const { parent_category_id } = req.body
  try {
    // Check if the parent category exists
    const parentCategoryQuery = await pool.query('SELECT id, child_categories FROM categories WHERE id = $1', [
      parent_category_id,
    ])
    const parentCategory = parentCategoryQuery.rows[0]

    if (!parentCategory) {
      return res.status(404).json({ error: 'Parent category not found' })
    }

    // Retrieve the current child categories of the parent category
    const currentChildCategories = parentCategory.child_categories || []

    // Check if the child category already exists in the array
    if (!currentChildCategories.includes(child_category_id)) {
      // Append the child_category_id to the array
      currentChildCategories.push(child_category_id)

      // Update the parent category's child_categories field
      await pool.query('UPDATE categories SET child_categories = $1 WHERE id = $2', [
        currentChildCategories,
        parent_category_id,
      ])

      // Update the parent_category_id of the child category
    }
    const parentUpdate = await pool.query('UPDATE categories SET parent_category = $1 WHERE id = $2', [
      parent_category_id,
      child_category_id,
    ])

    // Fetch all categories after updating
    const allCategories = await pool.query('SELECT * FROM categories')
    // TODO abstract out this repetetion
    // Iterate through each category to populate parent_category and child_categories
    for (let i = 0; i < allCategories.rows.length; i++) {
      const category = allCategories.rows[i]
      if (category.parent_category) {
        // Retrieve the corresponding parent category from categories table
        const parentCategory = await pool.query('SELECT * FROM categories WHERE id = $1', [category.parent_category])

        // If parent category is found, populate parent_category in category object
        if (parentCategory.rows.length > 0) {
          category.parent_category = parentCategory.rows[0]
        }
      }

      if (category.child_categories && category.child_categories.length > 0) {
        // Retrieve the corresponding child categories from categories table
        const childCategories = await pool.query('SELECT * FROM categories WHERE id = ANY($1)', [
          category.child_categories,
        ])

        // If child categories are found, populate child_categories in category object
        if (childCategories.rows.length > 0) {
          category.child_categories = childCategories.rows
        }
      }
    }

    // If categories are found, return them
    res.json({ categories: allCategories.rows })

    res.json({ msg: 'Parent category updated successfully', categories: allCategories.rows })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to update the child categories of a parent_category category and vice versa
router.put('/child_categories/:parent_category_id', authorize, async (req, res) => {
  const { parent_category_id } = req.params
  const { child_category_id } = req.body

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Update the parent category's child categories list
    const currentCategory = await pool.query('SELECT child_categories FROM categories WHERE id = $1', [
      parent_category_id,
    ])
    const currentChildCategories = currentCategory.rows[0].child_categories || []

    if (currentChildCategories.includes(child_category_id)) {
      await pool.query('ROLLBACK') // Rollback transaction if child category already exists
      return res.status(400).json({ msg: 'Child category already exists for this category' })
    }

    currentChildCategories.push(child_category_id)
    await pool.query('UPDATE categories SET child_categories = $1 WHERE id = $2', [
      currentChildCategories,
      parent_category_id,
    ])

    // Update the child category's parent category
    await pool.query('UPDATE categories SET parent_category = $1 WHERE id = $2', [
      parent_category_id,
      child_category_id,
    ])

    // Commit the transaction if all queries succeed
    await pool.query('COMMIT')

    // Fetch all categories after updating
    const allCategories = await pool.query('SELECT * FROM categories')

    // TODO abstract out this repetetion
    // Iterate through each category to populate parent_category and child_categories
    for (let i = 0; i < allCategories.rows.length; i++) {
      const category = allCategories.rows[i]
      if (category.parent_category) {
        // Retrieve the corresponding parent category from categories table
        const parentCategory = await pool.query('SELECT * FROM categories WHERE id = $1', [category.parent_category])

        // If parent category is found, populate parent_category in category object
        if (parentCategory.rows.length > 0) {
          category.parent_category = parentCategory.rows[0]
        }
      }

      if (category.child_categories && category.child_categories.length > 0) {
        // Retrieve the corresponding child categories from categories table
        const childCategories = await pool.query('SELECT * FROM categories WHERE id = ANY($1)', [
          category.child_categories,
        ])

        // If child categories are found, populate child_categories in category object
        if (childCategories.rows.length > 0) {
          category.child_categories = childCategories.rows
        }
      }
    }

    // If categories are found, return them
    res.json({ categories: allCategories.rows })

    res.json({ msg: 'Child category added successfully', categories: allCategories.rows })
  } catch (err) {
    console.error(err.message)
    await pool.query('ROLLBACK') // Rollback transaction on error
    res.status(500).send('Server error')
  }
})

// Route to remove a child category from a parent category
router.delete('/:parent_category_id/remove_child/:child_category_id', authorize, async (req, res) => {
  const { parent_category_id, child_category_id } = req.params
  try {
    // Retrieve the current child categories
    const currentCategory = await pool.query('SELECT child_categories FROM categories WHERE id = $1', [
      parent_category_id,
    ])
    const currentChildCategories = currentCategory.rows[0].child_categories || [] // Ensure to handle null value

    // Check if the child category exists
    if (!currentChildCategories.includes(child_category_id)) {
      return res.status(400).json({ msg: 'Child category does not exist for this category' })
    }

    // Remove the child category
    const updatedChildCategories = currentChildCategories.filter((category) => category !== child_category_id)
    await pool.query('UPDATE categories SET child_categories = $1 WHERE id = $2', [
      updatedChildCategories,
      parent_category_id,
    ])

    res.json({ msg: 'Child category removed successfully' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Route to add a linked entry to a category
router.put('/:category_id/link_entry', authorize, async (req, res) => {
  const { category_id } = req.params
  const { linked_entry_id } = req.body

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Update the category's linked entry
    await pool.query('UPDATE categories SET linked_entry = $1 WHERE id = $2', [linked_entry_id, category_id])

    // Update the entry's category_id
    await pool.query('UPDATE entries SET category_id = $1 WHERE id = $2', [category_id, linked_entry_id])

    // Commit the transaction if all queries succeed
    await pool.query('COMMIT')

    res.json({ msg: 'Linked entry added successfully' })
  } catch (err) {
    console.error(err.message)
    await pool.query('ROLLBACK') // Rollback transaction on error
    res.status(500).send('Server error')
  }
})

module.exports = router
