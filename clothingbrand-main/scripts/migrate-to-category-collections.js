/**
 * Migration Script: Move products to category-specific collections
 * 
 * This script:
 * 1. Reads all products from the main 'products' collection
 * 2. Groups them by category
 * 3. Creates separate collections for each category (products_jeans, products_shirts, etc.)
 * 4. Copies products to their respective category collections
 * 5. Optionally backs up or removes the old 'products' collection
 * 
 * Usage: node scripts/migrate-to-category-collections.js
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Helper to get collection name from category
function getCollectionName(category) {
  return `products_${category.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

async function migrateToCategories() {
  try {
    console.log('\n🚀 Starting migration to category-based collections...\n')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Get the old products collection
    const db = mongoose.connection.db
    const oldCollection = db.collection('products')

    // Count total products
    const totalProducts = await oldCollection.countDocuments()
    console.log(`📊 Found ${totalProducts} products to migrate\n`)

    if (totalProducts === 0) {
      console.log('⚠️  No products found in the products collection')
      await mongoose.disconnect()
      return
    }

    // Get all products
    const allProducts = await oldCollection.find({}).toArray()

    // Group by category
    const productsByCategory = {}
    allProducts.forEach(product => {
      const category = product.category || 'Uncategorized'
      if (!productsByCategory[category]) {
        productsByCategory[category] = []
      }
      productsByCategory[category].push(product)
    })

    console.log('📁 Products by category:')
    Object.keys(productsByCategory).forEach(category => {
      console.log(`   ${category}: ${productsByCategory[category].length} products`)
    })
    console.log('')

    // Migrate each category
    let totalMigrated = 0
    const migrations = []

    for (const [category, products] of Object.entries(productsByCategory)) {
      const collectionName = getCollectionName(category)
      const targetCollection = db.collection(collectionName)

      console.log(`🔄 Migrating ${products.length} products to '${collectionName}'...`)

      try {
        // Check if collection already has data
        const existingCount = await targetCollection.countDocuments()
        
        if (existingCount > 0) {
          console.log(`   ⚠️  Collection already has ${existingCount} documents`)
          console.log(`   Skipping to avoid duplicates. Delete '${collectionName}' first if you want to re-migrate.`)
          continue
        }

        // Insert products into category collection
        if (products.length > 0) {
          await targetCollection.insertMany(products, { ordered: false })
          totalMigrated += products.length
          
          // Create indexes on new collection
          await targetCollection.createIndex({ slug: 1 }, { unique: true })
          await targetCollection.createIndex({ price: 1 })
          await targetCollection.createIndex({ inStock: 1 })
          await targetCollection.createIndex({ discount: -1 })
          await targetCollection.createIndex({ gender: 1 })
          await targetCollection.createIndex({ price: 1, inStock: 1 })
          await targetCollection.createIndex({ soldCount: -1, viewCount: -1 })
          await targetCollection.createIndex(
            { name: 'text', description: 'text' },
            { weights: { name: 10, description: 1 } }
          )
          
          migrations.push({
            category,
            collection: collectionName,
            count: products.length,
            status: 'success'
          })
          
          console.log(`   ✅ Migrated ${products.length} products`)
        }
      } catch (error) {
        console.error(`   ❌ Error migrating ${category}:`, error.message)
        migrations.push({
          category,
          collection: collectionName,
          count: 0,
          status: 'failed',
          error: error.message
        })
      }
    }

    console.log('\n📊 Migration Summary:')
    console.log('━'.repeat(60))
    migrations.forEach(m => {
      const status = m.status === 'success' ? '✅' : '❌'
      console.log(`${status} ${m.collection.padEnd(30)} ${m.count} products`)
    })
    console.log('━'.repeat(60))
    console.log(`Total migrated: ${totalMigrated}/${totalProducts} products\n`)

    // Ask about backing up old collection
    console.log('💡 Next steps:')
    console.log('   1. Verify data in new collections')
    console.log('   2. Test API endpoints')
    console.log('   3. Backup old collection: db.products.renameCollection("products_backup")')
    console.log('   4. Or keep both collections for now\n')

    // List all new collections
    console.log('📁 New collections created:')
    const collections = await db.listCollections().toArray()
    collections
      .filter(c => c.name.startsWith('products_'))
      .forEach(c => {
        console.log(`   - ${c.name}`)
      })

    await mongoose.disconnect()
    console.log('\n✅ Migration completed successfully!\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

// Run migration
migrateToCategories()
