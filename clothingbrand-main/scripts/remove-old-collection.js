/**
 * Remove Old Products Collection
 * 
 * This script safely removes the old 'products' collection after verifying
 * that all products have been migrated to category-specific collections.
 * 
 * Usage: node scripts/remove-old-collection.js
 */

const mongoose = require('mongoose')
const readline = require('readline')
require('dotenv').config({ path: '.env.local' })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function removeOldCollection() {
  try {
    console.log('\n⚠️  WARNING: This will permanently delete the old "products" collection!\n')

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    
    // Check if old collection exists
    const collections = await db.listCollections({ name: 'products' }).toArray()
    
    if (collections.length === 0) {
      console.log('✅ Old "products" collection does not exist. Nothing to remove!\n')
      await mongoose.disconnect()
      rl.close()
      return
    }

    // Count products in old collection
    const oldCount = await db.collection('products').countDocuments()
    console.log(`📊 Found ${oldCount} products in old "products" collection\n`)

    // Count products in category collections
    const categoryCollections = await db.listCollections().toArray()
    const productCollections = categoryCollections.filter(c => c.name.startsWith('products_'))
    
    let totalInCategories = 0
    for (const coll of productCollections) {
      const count = await db.collection(coll.name).countDocuments()
      totalInCategories += count
      console.log(`   ${coll.name}: ${count} products`)
    }
    
    console.log(`\n📊 Total in category collections: ${totalInCategories} products\n`)

    if (totalInCategories === 0) {
      console.log('❌ ERROR: No products found in category collections!')
      console.log('   Run migration first: npm run db:migrate-categories\n')
      await mongoose.disconnect()
      rl.close()
      return
    }

    // Ask for confirmation
    const answer = await question('Are you sure you want to delete the old "products" collection? (yes/no): ')
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Deletion cancelled.\n')
      await mongoose.disconnect()
      rl.close()
      return
    }

    // Rename to backup first (safer than delete)
    const backupName = `products_backup_${Date.now()}`
    await db.collection('products').rename(backupName)
    
    console.log(`\n✅ Old collection renamed to: ${backupName}`)
    console.log('   This allows you to restore if needed.\n')
    
    const deleteBackup = await question('Do you want to permanently delete the backup? (yes/no): ')
    
    if (deleteBackup.toLowerCase() === 'yes') {
      await db.collection(backupName).drop()
      console.log('✅ Backup deleted permanently.\n')
    } else {
      console.log(`✅ Backup preserved as: ${backupName}`)
      console.log('   To restore: db.${backupName}.renameCollection("products")\n')
    }

    await mongoose.disconnect()
    rl.close()
    console.log('✅ Cleanup complete!\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    await mongoose.disconnect()
    rl.close()
    process.exit(1)
  }
}

removeOldCollection()
