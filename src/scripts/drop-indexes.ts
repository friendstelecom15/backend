import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();

async function dropAllIndexes() {
    // Use direct MongoDB connection without TypeORM
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/fdtelecom';
    const client = new MongoClient(mongoUrl);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const collections = await db.listCollections().toArray();

        console.log(`Found ${collections.length} collections`);

        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`\nProcessing collection: ${collectionName}`);

            try {
                // Get all indexes
                const indexes = await db.collection(collectionName).listIndexes().toArray();
                
                console.log(`  Found ${indexes.length} indexes:`);
                indexes.forEach(idx => console.log(`    - ${idx.name}`));

                // Drop all indexes except _id_
                for (const index of indexes) {
                    if (index.name !== '_id_') {
                        await db.collection(collectionName).dropIndex(index.name);
                        console.log(`  ✓ Dropped index: ${index.name}`);
                    }
                }
            } catch (err) {
                console.error(`  ✗ Error processing ${collectionName}:`, err.message);
            }
        }

        console.log('\n✅ All indexes dropped successfully!');
        await client.close();
    } catch (error) {
        console.error('❌ Error:', error);
        await client.close();
        process.exit(1);
    }
}

dropAllIndexes();
