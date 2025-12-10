/**
 * Migration Script: Add slugs to existing products
 * Generates SEO-friendly URL slugs for all products
 * 
 * Usage: npm run migrate-add-slugs
 */

require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

// Generate slug from product name
function generateSlug(name, timestamp) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .substring(0, 100)        // Limit length
  
  // Add unique timestamp suffix
  const uniqueSuffix = timestamp || Date.now().toString(36)
  return `${slug}-${uniqueSuffix}`
}

async function migrateAddSlugs() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('thehouseofrare')
    const collection = db.collection('products')

    console.log('\n📊 Starting slug migration...\n')

    // Get all products
    const products = await collection.find({}).toArray()
    console.log(`Found ${products.length} products`)

    if (products.length === 0) {
      console.log('⚠️  No products found in database')
      return
    }

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        // Skip if slug already exists
        if (product.slug) {
          console.log(`⏭️  Skipped: "${product.name}" (slug already exists: ${product.slug})`)
          skippedCount++
          continue
        }

        // Generate slug from name
        const slug = generateSlug(product.name, product._id.toString().substring(0, 8))
        
        // Update product with new slug
        await collection.updateOne(
          { _id: product._id },
          { 
            $set: { 
              slug,
              viewCount: product.viewCount || 0,
              soldCount: product.soldCount || 0
            } 
          }
        )

        console.log(`✅ Updated: "${product.name}" → ${slug}`)
        updatedCount++

      } catch (error) {
        console.error(`❌ Error updating "${product.name}":`, error.message)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Updated: ${updatedCount}`)
    console.log(`⏭️  Skipped (already had slugs): ${skippedCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📦 Total products: ${products.length}`)
    console.log('='.repeat(60))

    // Verify slugs are unique
    console.log('\n🔍 Verifying slug uniqueness...')
    const duplicateSlugs = await collection.aggregate([
      { $group: { _id: '$slug', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray()

    if (duplicateSlugs.length > 0) {
      console.warn('⚠️  Warning: Found duplicate slugs:', duplicateSlugs)
    } else {
      console.log('✅ All slugs are unique!')
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n✅ MongoDB connection closed')
  }
}

migrateAddSlugs()
