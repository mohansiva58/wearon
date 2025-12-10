const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rarerabbit:r%40rer%40bbit@rarerabbit.uyfrgct.mongodb.net/thehouseofrare?retryWrites=true&w=majority&appName=rarerabbit';

async function checkProducts() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('thehouseofrare');
    
    // Check what collections exist
    console.log('📦 COLLECTIONS:\n');
    const collections = await db.listCollections().toArray();
    collections.forEach(c => console.log(`  - ${c.name}`));
    
    // Check products in main collection
    console.log('\n\n📊 PRODUCTS COLLECTION:\n');
    const productsCount = await db.collection('products').countDocuments();
    console.log(`Total products: ${productsCount}`);
    
    // Group by category
    console.log('\n📁 Products by category:');
    const byCategory = await db.collection('products').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    byCategory.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} products`);
    });
    
    // Check for duplicates
    console.log('\n\n🔍 CHECKING FOR DUPLICATES:\n');
    const duplicates = await db.collection('products').aggregate([
      { $group: { 
          _id: { name: '$name', category: '$category' }, 
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        } 
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} duplicate products:`);
      duplicates.forEach(dup => {
        console.log(`  - "${dup._id.name}" in ${dup._id.category}: ${dup.count} copies`);
        console.log(`    IDs: ${dup.ids.join(', ')}`);
      });
    } else {
      console.log('✅ No duplicates found');
    }
    
    // Check Jackets specifically
    console.log('\n\n🧥 JACKETS DETAILS:\n');
    const jackets = await db.collection('products')
      .find({ category: 'Jackets' })
      .project({ _id: 1, name: 1, category: 1, inStock: 1 })
      .toArray();
    
    console.log(`Found ${jackets.length} jackets:`);
    jackets.forEach((j, i) => {
      console.log(`  ${i+1}. ${j.name} (${j._id}) - Stock: ${j.inStock}`);
    });
    
    // Check if category field has variations
    console.log('\n\n🔤 CHECKING CATEGORY FIELD VARIATIONS:\n');
    const categoryVariations = await db.collection('products').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('Unique category values:');
    categoryVariations.forEach(v => {
      console.log(`  "${v._id}" (${v.count} products)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkProducts();
