/**
 * Cleanup Script: Remove duplicates and migrate remaining products
 * 
 * This script:
 * 1. Finds products in old 'products' collection
 * 2. Checks if they exist in category collections
 * 3. Migrates products that aren't in category collections yet
 * 4. Optionally clears the old 'products' collection
 * 
 * Usage: node scripts/cleanup-and-migrate.js
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

function getCollectionName(category) {
  return `products_${category.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

async function cleanupAndMigrate() {
  try {
    console.log('\n🔄 Starting cleanup and migration...\n')

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    
    // Get all products from old collection
    const oldProducts = await db.collection('products').find({}).toArray()
    console.log(`📊 Found ${oldProducts.length} products in old 'products' collection\n`)

    if (oldProducts.length === 0) {
      console.log('✅ No products to migrate!')
      await mongoose.disconnect()
      return
    }

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const product of oldProducts) {
      try {
        const category = product.category || 'Uncategorized'
        const targetCollectionName = getCollectionName(category)
        const targetCollection = db.collection(targetCollectionName)

        // Check if product already exists in category collection
        const exists = await targetCollection.findOne({ _id: product._id })

        if (exists) {
          console.log(`⏭️  Skipped: "${product.name}" (already in ${targetCollectionName})`)
          skipped++
        } else {
          // Insert into category collection
          await targetCollection.insertOne(product)
          
          // Create indexes if needed
          try {
            await targetCollection.createIndex({ slug: 1 }, { unique: true })
            await targetCollection.createIndex({ price: 1 })
            await targetCollection.createIndex({ inStock: 1 })
            await targetCollection.createIndex({ discount: -1 })
            await targetCollection.createIndex({ gender: 1 })
          } catch (e) {
            // Indexes might already exist, ignore
          }

          console.log(`✅ Migrated: "${product.name}" → ${targetCollectionName}`)
          migrated++
        }
      } catch (error) {
        console.error(`❌ Error migrating "${product.name}":`, error.message)
        errors++
      }
    }

    console.log('\n' + '─'.repeat(60))
    console.log(`📊 Migration Summary:`)
    console.log(`   ✅ Migrated: ${migrated} products`)
    console.log(`   ⏭️  Skipped (duplicates): ${skipped} products`)
    console.log(`   ❌ Errors: ${errors} products`)
    console.log('─'.repeat(60))

    if (migrated > 0) {
      console.log('\n💡 Next steps:')
      console.log('   1. Verify products in category collections')
      console.log('   2. Test /shop page - should show all products now')
      console.log('   3. Optional: Rename old collection:')
      console.log('      db.products.renameCollection("products_backup")')
    }

    await mongoose.disconnect()
    console.log('\n✅ Cleanup completed!\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

cleanupAndMigrate()
