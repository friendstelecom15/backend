# 🚀 Quick Start Guide - New Product Module

## Step 1: Run Migration

```bash
npm run typeorm migration:run
```

## Step 2: Test with Postman/Insomnia

### Create Product (Admin/Management Only)

**Endpoint**: `POST http://localhost:3000/products-new`  
**Headers**: 
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body** (Minimal Example):
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "slug": "samsung-galaxy-s24-ultra",
  "description": "Latest flagship from Samsung",
  "categoryId": "your-category-uuid",
  "brandId": "your-brand-uuid",
  "regions": [
    {
      "regionName": "Global",
      "isDefault": true,
      "colors": [
        {
          "colorName": "Titanium Black",
          "colorCode": "#000000",
          "storages": [
            {
              "storageSize": "256GB",
              "price": {
                "regularPrice": 1199.99,
                "stockQuantity": 100
              }
            },
            {
              "storageSize": "512GB",
              "price": {
                "regularPrice": 1399.99,
                "stockQuantity": 50
              }
            }
          ]
        },
        {
          "colorName": "Titanium Gray",
          "colorCode": "#808080",
          "storages": [
            {
              "storageSize": "256GB",
              "price": {
                "regularPrice": 1199.99,
                "discountPrice": 1099.99,
                "discountPercent": 8.33,
                "stockQuantity": 75
              }
            }
          ]
        }
      ]
    }
  ],
  "images": [
    {
      "imageUrl": "https://example.com/galaxy-s24-ultra.jpg",
      "isThumbnail": true,
      "altText": "Samsung Galaxy S24 Ultra"
    }
  ],
  "specifications": [
    {
      "groupName": "Display",
      "specs": [
        {
          "specKey": "Screen Size",
          "specValue": "6.8 inches"
        },
        {
          "specKey": "Resolution",
          "specValue": "1440 x 3120 pixels"
        }
      ]
    },
    {
      "groupName": "Camera",
      "specs": [
        {
          "specKey": "Main Camera",
          "specValue": "200 MP"
        },
        {
          "specKey": "Front Camera",
          "specValue": "12 MP"
        }
      ]
    }
  ]
}
```

### Get All Products

**Endpoint**: `GET http://localhost:3000/products-new`

**Query Parameters** (all optional):
```
?categoryId=uuid
&brandId=uuid
&search=samsung
&isActive=true
&isOnline=true
&limit=20
&offset=0
```

### Get Product by Slug

**Endpoint**: `GET http://localhost:3000/products-new/samsung-galaxy-s24-ultra`

### Get Variant Price

**Endpoint**: `GET http://localhost:3000/products-new/{productId}/variant-price`

**Query Parameters**:
```
?regionId=uuid
&colorId=uuid
&storageId=uuid
```

### Search Products

**Endpoint**: `GET http://localhost:3000/products-new/search?q=samsung`

### Update Product (Admin/Management Only)

**Endpoint**: `PATCH http://localhost:3000/products-new/{productId}`  
**Headers**: 
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body** (Update any field):
```json
{
  "name": "Samsung Galaxy S24 Ultra - Updated",
  "isActive": true,
  "freeShipping": true,
  "rewardPoints": 1200
}
```

### Delete Product (Admin Only)

**Endpoint**: `DELETE http://localhost:3000/products-new/{productId}`  
**Headers**: 
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Step 3: Frontend Integration Example

### Fetch Products
```typescript
const response = await fetch('http://localhost:3000/products-new?limit=20');
const products = await response.json();

products.forEach(product => {
  console.log(`${product.name}: $${product.priceRange.min} - $${product.priceRange.max}`);
  console.log(`Total Stock: ${product.totalStock}`);
});
```

### Get Product Details
```typescript
const response = await fetch('http://localhost:3000/products-new/samsung-galaxy-s24-ultra');
const product = await response.json();

// Display product
console.log(product.name);
console.log(product.description);

// Display variants
product.regions.forEach(region => {
  console.log(`Region: ${region.name}`);
  region.colors.forEach(color => {
    console.log(`  Color: ${color.name} (${color.code})`);
    color.storages.forEach(storage => {
      console.log(`    Storage: ${storage.size}`);
      console.log(`    Price: $${storage.price.final}`);
      console.log(`    Stock: ${storage.stock}`);
    });
  });
});

// Display specifications
product.specifications.forEach(specGroup => {
  console.log(`${specGroup.group}:`);
  specGroup.specs.forEach(spec => {
    console.log(`  ${spec.key}: ${spec.value}`);
  });
});
```

### Calculate Final Price
```typescript
function getFinalPrice(price) {
  if (price.campaignActive && price.campaign) {
    return price.campaign;
  }
  if (price.discount) {
    return price.discount;
  }
  return price.regular;
}
```

## Step 4: Common Queries

### Get Low Stock Products
```sql
SELECT 
  p.name,
  r.region_name,
  c.color_name,
  s.storage_size,
  pr.stock_quantity
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE pr.stock_quantity <= pr.low_stock_alert
ORDER BY pr.stock_quantity ASC;
```

### Update Stock After Order
```sql
UPDATE product_prices
SET stock_quantity = stock_quantity - 1,
    updated_at = NOW()
WHERE storage_id = 'storage-uuid'
  AND stock_quantity > 0;
```

### Get Active Campaigns
```sql
SELECT 
  p.name,
  pr.regular_price,
  pr.campaign_price,
  ROUND(((pr.regular_price - pr.campaign_price) / pr.regular_price * 100), 2) as discount_percentage
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE pr.campaign_price IS NOT NULL
  AND pr.campaign_start <= NOW()
  AND pr.campaign_end >= NOW()
ORDER BY discount_percentage DESC;
```

## Step 5: Troubleshooting

### Issue: Migration Fails
```bash
# Check if uuid extension exists
psql -d your_database -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Manually run migration
npm run typeorm migration:run
```

### Issue: Circular Dependency Errors
These are TypeScript compilation warnings and will resolve when the project builds. All entities are properly structured.

### Issue: Authentication Required
Make sure you have:
1. Valid JWT token in Authorization header
2. User with 'admin' or 'management' role

### Issue: Cannot Find Module
Run:
```bash
npm install
npm run build
```

## Step 6: Testing Checklist

- [ ] Create product with single variant
- [ ] Create product with multiple regions
- [ ] Create product with multiple colors
- [ ] Create product with multiple storage options
- [ ] Add images and videos
- [ ] Add specifications
- [ ] Query product by slug
- [ ] Filter products by category
- [ ] Search products
- [ ] Get variant-specific price
- [ ] Update product
- [ ] Soft delete product
- [ ] Check campaign pricing
- [ ] Verify stock tracking

## Need Help?

📚 **Full Documentation**: See `IMPLEMENTATION_GUIDE.md`  
🗂️ **Database Schema**: See `SCHEMA.sql`  
🏗️ **Architecture**: See `PRODUCT_MODULE_ARCHITECTURE.md`  
📋 **Summary**: See `IMPLEMENTATION_SUMMARY.md`

---

**Happy Coding! 🎉**
