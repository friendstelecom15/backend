import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';

/**
 * Script to clean up orphaned data in the database
 * Run this when you have duplicate key errors or partial product data
 */
async function cleanupOrphanedData() {
  const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/fd_telecom';
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Find and remove regions with null regionName
    console.log('\n1. Finding regions with null regionName...');
    const regionsWithNullName = await db
      .collection('product_regions')
      .find({ regionName: null })
      .toArray();
    
    console.log(`Found ${regionsWithNullName.length} regions with null regionName`);
    
    if (regionsWithNullName.length > 0) {
      const deleteResult = await db
        .collection('product_regions')
        .deleteMany({ regionName: null });
      console.log(`Deleted ${deleteResult.deletedCount} regions with null regionName`);
    }

    // Find and remove colors with null colorName
    console.log('\n2. Finding colors with null colorName...');
    const colorsWithNullName = await db
      .collection('product_colors')
      .find({ colorName: null })
      .toArray();
    
    console.log(`Found ${colorsWithNullName.length} colors with null colorName`);
    
    if (colorsWithNullName.length > 0) {
      const deleteResult = await db
        .collection('product_colors')
        .deleteMany({ colorName: null });
      console.log(`Deleted ${deleteResult.deletedCount} colors with null colorName`);
    }

    // Find orphaned regions (regions whose products don't exist)
    console.log('\n3. Finding orphaned regions...');
    const allRegions = await db.collection('product_regions').find().toArray();
    const allProducts = await db.collection('products').find().toArray();
    const productIds = new Set(allProducts.map(p => p._id.toString()));
    
    const orphanedRegions = allRegions.filter(
      region => !productIds.has(region.productId?.toString())
    );
    
    console.log(`Found ${orphanedRegions.length} orphaned regions`);
    
    if (orphanedRegions.length > 0) {
      const orphanedRegionIds = orphanedRegions.map(r => r._id);
      const deleteResult = await db
        .collection('product_regions')
        .deleteMany({ _id: { $in: orphanedRegionIds } });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned regions`);
    }

    // Find orphaned colors (colors whose regions/products don't exist)
    console.log('\n4. Finding orphaned colors...');
    const allColors = await db.collection('product_colors').find().toArray();
    const regionIds = new Set(allRegions.map(r => r._id.toString()));
    
    const orphanedColors = allColors.filter(color => {
      if (color.productId && !productIds.has(color.productId.toString())) {
        return true;
      }
      if (color.regionId && !regionIds.has(color.regionId.toString())) {
        return true;
      }
      return false;
    });
    
    console.log(`Found ${orphanedColors.length} orphaned colors`);
    
    if (orphanedColors.length > 0) {
      const orphanedColorIds = orphanedColors.map(c => c._id);
      const deleteResult = await db
        .collection('product_colors')
        .deleteMany({ _id: { $in: orphanedColorIds } });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned colors`);
    }

    // Find orphaned storages
    console.log('\n5. Finding orphaned storages...');
    const allStorages = await db.collection('product_storages').find().toArray();
    const colorIds = new Set(allColors.map(c => c._id.toString()));
    
    const orphanedStorages = allStorages.filter(
      storage => storage.colorId && !colorIds.has(storage.colorId.toString())
    );
    
    console.log(`Found ${orphanedStorages.length} orphaned storages`);
    
    if (orphanedStorages.length > 0) {
      const orphanedStorageIds = orphanedStorages.map(s => s._id);
      const deleteResult = await db
        .collection('product_storages')
        .deleteMany({ _id: { $in: orphanedStorageIds } });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned storages`);
    }

    // Find orphaned prices
    console.log('\n6. Finding orphaned prices...');
    const allPrices = await db.collection('product_prices').find().toArray();
    const storageIds = new Set(allStorages.map(s => s._id.toString()));
    
    const orphanedPrices = allPrices.filter(
      price => price.storageId && !storageIds.has(price.storageId.toString())
    );
    
    console.log(`Found ${orphanedPrices.length} orphaned prices`);
    
    if (orphanedPrices.length > 0) {
      const orphanedPriceIds = orphanedPrices.map(p => p._id);
      const deleteResult = await db
        .collection('product_prices')
        .deleteMany({ _id: { $in: orphanedPriceIds } });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned prices`);
    }

    // Find orphaned images
    console.log('\n7. Finding orphaned images...');
    const allImages = await db.collection('product_images').find().toArray();
    
    const orphanedImages = allImages.filter(
      image => !productIds.has(image.productId?.toString())
    );
    
    console.log(`Found ${orphanedImages.length} orphaned images`);
    
    if (orphanedImages.length > 0) {
      const orphanedImageIds = orphanedImages.map(i => i._id);
      const deleteResult = await db
        .collection('product_images')
        .deleteMany({ _id: { $in: orphanedImageIds } });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned images`);
    }

    // Find orphaned videos
    console.log('\n8. Finding orphaned videos...');
    const allVideos = await db.collection('product_videos').find().toArray();
    
    const orphanedVideos = allVideos.filter(
      video => !productIds.has(video.productId?.toString())
    );
    
    console.log(`Found ${orphanedVideos.length} orphaned videos`);
    
    if (orphanedVideos.length > 0) {
      const orphanedVideoIds = orphanedVideos.map(v => v._id);
      const deleteResult = await db
        .collection('product_videos')
        .deleteMany({ _id: { $in: orphanedVideoIds } });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned videos`);
    }

    // Find orphaned specifications
    console.log('\n9. Finding orphaned specifications...');
    const allSpecs = await db.collection('product_specifications').find().toArray();
    
    const orphanedSpecs = allSpecs.filter(
      spec => !productIds.has(spec.productId?.toString())
    );
    
    console.log(`Found ${orphanedSpecs.length} orphaned specifications`);
    
    if (orphanedSpecs.length > 0) {
      const orphanedSpecIds = orphanedSpecs.map(s => s._id);
      const deleteResult = await db
        .collection('product_specifications')
        .deleteMany({ _id: { $in: orphanedSpecIds } });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned specifications`);
    }

    console.log('\n✅ Cleanup completed successfully!');

  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the cleanup
cleanupOrphanedData();
