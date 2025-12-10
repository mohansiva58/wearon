/**
 * Optimized MongoDB Index Creation Script
 * Creates comprehensive indexes for high-performance queries
 * 
 * Usage: npm run create-optimized-indexes
 */

require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

async function createOptimizedIndexes() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('thehouseofrare')
    const collection = db.collection('products')

    console.log('\n📊 Creating optimized indexes...\n')

    // Optional: Drop all existing indexes for a fresh start (uncomment if needed)
    // try {
    //   await collection.dropIndexes()
    //   console.log('🗑️  Dropped all existing indexes (except _id)')
    // } catch (error) {
    //   console.log('ℹ️  No indexes to drop')
    // }

    const indexes = []

    // ===== SINGLE FIELD INDEXES =====
    
    // 1. Category index (most common filter)
    indexes.push({ 
      name: 'category_1',
      keys: { category: 1 },
      options: { background: true }
    })
    
    // 2. Price index (sorting and filtering)
    indexes.push({ 
      name: 'price_1',
      keys: { price: 1 },
      options: { background: true }
    })
    
    // 3. Discount index (sales/deals sorting)
    indexes.push({ 
      name: 'discount_-1',
      keys: { discount: -1 },
      options: { background: true }
    })
    
    // 4. Gender index (filter by gender)
    indexes.push({ 
      name: 'gender_1',
      keys: { gender: 1 },
      options: { background: true }
    })
    
    // 5. InStock index (filter available products)
    indexes.push({ 
      name: 'inStock_1',
      keys: { inStock: 1 },
      options: { background: true }
    })

    // 6. Slug index (SEO URLs - unique)
    indexes.push({ 
      name: 'slug_1_unique',
      keys: { slug: 1 },
      options: { unique: true, sparse: true, background: true }
    })

    // ===== TEXT SEARCH INDEX =====
    
    // 7. Text search index (name, description, category)
    indexes.push({
      name: 'text_search_optimized',
      keys: { 
        name: 'text', 
        description: 'text',
        category: 'text'
      },
      options: {
        weights: {
          name: 10,        // Name matches are most important
          category: 5,     // Category matches are moderately important
          description: 1   // Description matches are least important
        },
        background: true
      }
    })

    // ===== COMPOUND INDEXES (for combined queries) =====
    
    // 8. Category + Price (most common filter combination)
    indexes.push({
      name: 'category_1_price_1',
      keys: { category: 1, price: 1 },
      options: { background: true }
    })

    // 9. Category + Gender (filter by both)
    indexes.push({
      name: 'category_1_gender_1',
      keys: { category: 1, gender: 1 },
      options: { background: true }
    })

    // 10. InStock + Category (show available products in category)
    indexes.push({
      name: 'inStock_1_category_1',
      keys: { inStock: 1, category: 1 },
      options: { background: true }
    })

    // 11. Discount + InStock (deals page - high discount available products)
    indexes.push({
      name: 'discount_-1_inStock_1',
      keys: { discount: -1, inStock: 1 },
      options: { background: true }
    })

    // 12. SoldCount + ViewCount (popularity sorting)
    indexes.push({
      name: 'soldCount_-1_viewCount_-1',
      keys: { soldCount: -1, viewCount: -1 },
      options: { background: true }
    })

    // 13. Category + InStock + Price (complex shop filtering)
    indexes.push({
      name: 'category_1_inStock_1_price_1',
      keys: { category: 1, inStock: 1, price: 1 },
      options: { background: true }
    })

    // 14. CreatedAt index (newest products)
    indexes.push({
      name: 'createdAt_-1',
      keys: { createdAt: -1 },
      options: { background: true }
    })

    // Create all indexes
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const index of indexes) {
      try {
        await collection.createIndex(index.keys, {
          name: index.name,
          ...index.options
        })
        console.log(`✅ Created: ${index.name}`)
        successCount++
      } catch (error) {
        if (error.code === 85 || error.codeName === 'IndexOptionsConflict' || error.code === 11000) {
          console.log(`⚠️  Already exists: ${index.name}`)
          skipCount++
        } else {
          console.error(`❌ Error creating ${index.name}:`, error.message)
          errorCount++
        }
      }
    }

    // List all indexes
    console.log('\n' + '='.repeat(60))
    console.log('📋 ALL INDEXES IN PRODUCTS COLLECTION')
    console.log('='.repeat(60) + '\n')
    
    const existingIndexes = await collection.listIndexes().toArray()
    existingIndexes.forEach((idx, i) => {
      console.log(`${i + 1}. ${idx.name}`)
      console.log(`   Keys: ${JSON.stringify(idx.key)}`)
      if (idx.unique) console.log(`   ⭐ Unique: true`)
      if (idx.sparse) console.log(`   Sparse: true`)
      if (idx.weights) console.log(`   Weights: ${JSON.stringify(idx.weights)}`)
      console.log()
    })

    console.log('='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully created: ${successCount}`)
    console.log(`⚠️  Already existed: ${skipCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📊 Total indexes: ${existingIndexes.length}`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n✅ MongoDB connection closed')
  }
}

createOptimizedIndexes()
