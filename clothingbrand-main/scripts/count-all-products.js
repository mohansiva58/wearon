/**
 * Diagnostic Script: Count products in all collections
 * 
 * This script checks all product collections and counts products
 * 
 * Usage: node scripts/count-all-products.js
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function countAllProducts() {
  try {
    console.log('\n🔍 Counting products in all collections...\n')

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    
    console.log('📊 Product Collections Found:\n')
    console.log('─'.repeat(60))
    
    let totalProducts = 0
    const results = []
    
    // Check all product collections
    for (const coll of collections) {
      if (coll.name.startsWith('products') || coll.name === 'products') {
        const count = await db.collection(coll.name).countDocuments()
        totalProducts += count
        results.push({ name: coll.name, count })
        
        // Also show sample product names
        if (count > 0) {
          const samples = await db.collection(coll.name)
            .find({}, { projection: { name: 1, category: 1 } })
            .limit(3)
            .toArray()
          
          console.log(`📁 ${coll.name.padEnd(30)} ${count} products`)
          samples.forEach(p => {
            console.log(`   └─ ${p.name} (${p.category || 'N/A'})`)
          })
          console.log('')
        } else {
          console.log(`📁 ${coll.name.padEnd(30)} ${count} products (empty)`)
        }
      }
    }
    
    console.log('─'.repeat(60))
    console.log(`\n✅ Total products across all collections: ${totalProducts}\n`)
    
    // Show distribution
    console.log('📊 Distribution:')
    results
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .forEach(r => {
        const percentage = ((r.count / totalProducts) * 100).toFixed(1)
        console.log(`   ${r.name}: ${r.count} (${percentage}%)`)
      })
    
    await mongoose.disconnect()
    console.log('\n✅ Diagnostic complete!\n')

  } catch (error) {
    console.error('\n❌ Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

countAllProducts()
