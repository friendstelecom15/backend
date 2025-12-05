import AppDataSource from '../config/data-source';

async function fixMongoDBIndexes() {
  try {
    console.log('Connecting to database...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Access MongoDB native driver
    const mongoDriver = AppDataSource.driver as any;
    const connection = mongoDriver.queryRunner.databaseConnection;
    // In some versions/configs, this is the MongoClient, in others it's the Db
    const db = connection.constructor.name === 'MongoClient' ? connection.db() : connection;

    console.log(`Connected to database: ${db.databaseName}`);
    console.log('Starting index cleanup and recreation...\n');

    // 1. Fix product_regions indexes
    console.log('Fixing product_regions collection...');
    const regionsCollection = db.collection('product_regions');
    
    // Drop all existing indexes except _id
    const regionIndexes = await regionsCollection.indexes();
    for (const index of regionIndexes) {
      if (index.name !== '_id_') {
        console.log(`  Dropping index: ${index.name}`);
        await regionsCollection.dropIndex(index.name);
      }
    }
    
    // Create proper composite unique index
    console.log('  Creating composite unique index: productId + regionName');
    await regionsCollection.createIndex(
      { productId: 1, regionName: 1 },
      { 
        unique: true,
        sparse: false,
        name: 'productId_1_regionName_1_unique'
      }
    );

    // 2. Fix product_colors indexes
    console.log('\nFixing product_colors collection...');
    const colorsCollection = db.collection('product_colors');
    
    // Drop all existing indexes except _id
    const colorIndexes = await colorsCollection.indexes();
    for (const index of colorIndexes) {
      if (index.name !== '_id_') {
        console.log(`  Dropping index: ${index.name}`);
        await colorsCollection.dropIndex(index.name);
      }
    }
    
    // Create proper composite unique indexes
    console.log('  Creating composite unique index: productId + colorName');
    await colorsCollection.createIndex(
      { productId: 1, colorName: 1 },
      { 
        unique: true,
        sparse: true,
        background: true,
        name: 'IDX_product_color_product_unique',
      }
    );
    
    console.log('  Creating composite unique index: regionId + colorName');
    await colorsCollection.createIndex(
      { regionId: 1, colorName: 1 },
      { 
        unique: true,
        sparse: true,
        background: true,
        name: 'IDX_product_color_region_unique',
      }
    );
    
    console.log('  Creating composite unique index: networkId + colorName');
    await colorsCollection.createIndex(
      { networkId: 1, colorName: 1 },
      { 
        unique: true,
        sparse: true,
        background: true,
        name: 'IDX_product_color_network_unique',
      }
    );

    // 3. Fix product_storages indexes
    console.log('\nFixing product_storages collection...');
    const storagesCollection = db.collection('product_storages');
    
    // Drop all existing indexes except _id
    const storageIndexes = await storagesCollection.indexes();
    for (const index of storageIndexes) {
      if (index.name !== '_id_') {
        console.log(`  Dropping index: ${index.name}`);
        await storagesCollection.dropIndex(index.name);
      }
    }
    
    // Create proper composite unique indexes
    console.log('  Creating composite unique index: colorId + storageSize');
    await storagesCollection.createIndex(
      { colorId: 1, storageSize: 1 },
      { 
        unique: true,
        sparse: true,
        background: true,
        name: 'IDX_product_storage_color_unique',
      }
    );
    
    console.log('  Creating composite unique index: regionId + storageSize');
    await storagesCollection.createIndex(
      { regionId: 1, storageSize: 1 },
      { 
        unique: true,
        sparse: true,
        background: true,
        name: 'IDX_product_storage_region_unique',
      }
    );

    console.log('  Creating composite unique index: networkId + storageSize');
    await storagesCollection.createIndex(
      { networkId: 1, storageSize: 1 },
      { 
        unique: true,
        sparse: true,
        background: true,
        name: 'IDX_product_storage_network_unique',
      }
    );

    // 4. Fix product_specifications indexes
    console.log('\nFixing product_specifications collection...');
    const specsCollection = db.collection('product_specifications');
    
    // Drop all existing indexes except _id
    const specIndexes = await specsCollection.indexes();
    for (const index of specIndexes) {
      if (index.name !== '_id_') {
        console.log(`  Dropping index: ${index.name}`);
        await specsCollection.dropIndex(index.name);
      }
    }
    
    // Create proper composite unique index
    console.log('  Creating composite unique index: productId + specKey');
    await specsCollection.createIndex(
      { productId: 1, specKey: 1 },
      { 
        unique: true,
        sparse: false,
        name: 'productId_1_specKey_1_unique'
      }
    );

    // 5. Verify all indexes
    console.log('\n=== Verifying Indexes ===\n');
    
    console.log('product_regions indexes:');
    const regionFinalIndexes = await regionsCollection.indexes();
    regionFinalIndexes.forEach(idx => console.log(`  - ${idx.name}:`, idx.key));
    
    console.log('\nproduct_colors indexes:');
    const colorFinalIndexes = await colorsCollection.indexes();
    colorFinalIndexes.forEach(idx => console.log(`  - ${idx.name}:`, idx.key));
    
    console.log('\nproduct_storages indexes:');
    const storageFinalIndexes = await storagesCollection.indexes();
    storageFinalIndexes.forEach(idx => console.log(`  - ${idx.name}:`, idx.key));
    
    console.log('\nproduct_specifications indexes:');
    const specFinalIndexes = await specsCollection.indexes();
    specFinalIndexes.forEach(idx => console.log(`  - ${idx.name}:`, idx.key));

    console.log('\n✅ All indexes fixed successfully!');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

fixMongoDBIndexes();
