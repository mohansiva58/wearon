const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rarerabbit:r%40rer%40bbit@rarerabbit.uyfrgct.mongodb.net/thehouseofrare?retryWrites=true&w=majority&appName=rarerabbit';

async function checkAllCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('thehouseofrare');
    
    console.log('📊 CHECKING ALL PRODUCT COLLECTIONS:\n');
    
    const productCollections = [
      'products',
      'products_jacket',
      'products_jackets', 
      'products_shirt',
      'products_shirts',
      'products_jeans',
      'products_polo',
      'products_trouser',
      'products_tshirt'
    ];
    
    for (const collName of productCollections) {
      try {
        const count = await db.collection(collName).countDocuments();
        console.log(`\n${collName}: ${count} documents`);
        
        if (count > 0) {
          const samples = await db.collection(collName).find({}).limit(3).toArray();
          samples.forEach(item => {
            console.log(`  - ${item.name} (category: "${item.category || 'N/A'}")`);
          });
        }
      } catch (e) {
        console.log(`${collName}: Collection doesn't exist or error`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkAllCollections();
