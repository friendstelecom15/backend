# E-Commerce Product Module Architecture

## Database Schema & ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT MODULE ER DIAGRAM                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│     PRODUCTS         │
│──────────────────────│
│ id (UUID) PK         │
│ name                 │
│ slug (UNIQUE)        │
│ description          │
│ category_id FK       │
│ brand_id FK          │
│ product_code         │
│ sku                  │
│ warranty             │
│ is_active            │
│ is_online            │
│ is_pos               │
│ is_pre_order         │
│ is_official          │
│ free_shipping        │
│ reward_points        │
│ min_booking_price    │
│ seo_title            │
│ seo_description      │
│ seo_keywords[]       │
│ seo_canonical        │
│ tags[]               │
│ created_at           │
│ updated_at           │
│ deleted_at           │
└──────────────────────┘
          │
          │ 1:N
          ├─────────────────────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│  PRODUCT_REGIONS     │          │  PRODUCT_IMAGES      │
│──────────────────────│          │──────────────────────│
│ id (UUID) PK         │          │ id (UUID) PK         │
│ product_id FK        │          │ product_id FK        │
│ region_name          │          │ image_url            │
│ is_default           │          │ is_thumbnail         │
│ display_order        │          │ alt_text             │
│ created_at           │          │ display_order        │
└──────────────────────┘          │ created_at           │
          │                        └──────────────────────┘
          │ 1:N
          ▼
┌──────────────────────┐
│  PRODUCT_COLORS      │
│──────────────────────│
│ id (UUID) PK         │
│ region_id FK         │
│ color_name           │
│ color_code           │
│ display_order        │
│ created_at           │
└──────────────────────┘
          │
          │ 1:N
          ▼
┌──────────────────────┐
│  PRODUCT_STORAGES    │
│──────────────────────│
│ id (UUID) PK         │
│ color_id FK          │
│ storage_size         │
│ display_order        │
│ created_at           │
└──────────────────────┘
          │
          │ 1:1
          ▼
┌──────────────────────┐
│  PRODUCT_PRICES      │
│──────────────────────│
│ id (UUID) PK         │
│ storage_id FK        │
│ regular_price        │
│ compare_price        │
│ discount_price       │
│ discount_percent     │
│ campaign_price       │
│ campaign_start       │
│ campaign_end         │
│ stock_quantity       │
│ low_stock_alert      │
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│  PRODUCT_VIDEOS      │
│──────────────────────│
│ id (UUID) PK         │
│ product_id FK        │
│ video_url            │
│ video_type           │
│ display_order        │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│  SPEC_GROUPS         │
│──────────────────────│
│ id (UUID) PK         │
│ group_name           │
│ display_order        │
│ icon                 │
│ created_at           │
└──────────────────────┘
          │
          │ 1:N
          ▼
┌──────────────────────┐
│  PRODUCT_SPECS       │
│──────────────────────│
│ id (UUID) PK         │
│ product_id FK        │
│ spec_group_id FK     │
│ spec_key             │
│ spec_value           │
│ display_order        │
│ created_at           │
└──────────────────────┘
```

## Variant & Pricing Logic

### Hierarchical Structure:
```
Product
  └── Region/Variant (International, UAE, UK, etc.)
       └── Color (Black, White, Blue, etc.)
            └── Storage/Size (64GB, 128GB, 256GB, etc.)
                 └── Price (regular, discount, campaign, stock)
```

### Price Selection Query:
```typescript
// Client sends: productId, regionId, colorId, storageId
// Backend returns: specific price + stock for that exact combination

SELECT 
  pr.regular_price,
  pr.compare_price,
  pr.discount_price,
  pr.discount_percent,
  pr.campaign_price,
  pr.stock_quantity
FROM product_prices pr
JOIN product_storages ps ON pr.storage_id = ps.id
JOIN product_colors pc ON ps.color_id = pc.id
JOIN product_regions preg ON pc.region_id = preg.id
WHERE preg.product_id = ? 
  AND preg.id = ?
  AND pc.id = ?
  AND ps.id = ?
```

## API Request/Response Format

### POST /products - Create Product

```json
{
  "name": "iPhone 15 Pro Max",
  "slug": "iphone-15-pro-max",
  "description": "Latest flagship phone with A17 Pro chip",
  "categoryId": "uuid-category",
  "brandId": "uuid-brand",
  "productCode": "IPHONE15PM",
  "sku": "IPH-15-PM-001",
  "warranty": "1 Year Official Warranty",
  "isActive": true,
  "isOnline": true,
  "isPos": true,
  "isPreOrder": false,
  "isOfficial": true,
  "freeShipping": true,
  "rewardPoints": 1500,
  "minBookingPrice": 0,
  "seoTitle": "Buy iPhone 15 Pro Max - Best Price",
  "seoDescription": "Shop iPhone 15 Pro Max with free shipping",
  "seoKeywords": ["iphone", "apple", "flagship"],
  "seoCanonical": "https://example.com/products/iphone-15-pro-max",
  "tags": ["flagship", "premium", "5g"],
  "images": [
    {
      "imageUrl": "https://cdn.example.com/iphone-1.jpg",
      "isThumbnail": true,
      "altText": "iPhone 15 Pro Max Front",
      "displayOrder": 1
    },
    {
      "imageUrl": "https://cdn.example.com/iphone-2.jpg",
      "isThumbnail": false,
      "altText": "iPhone 15 Pro Max Back",
      "displayOrder": 2
    }
  ],
  "videos": [
    {
      "videoUrl": "https://youtube.com/watch?v=xxx",
      "videoType": "youtube",
      "displayOrder": 1
    }
  ],
  "regions": [
    {
      "regionName": "International",
      "isDefault": true,
      "displayOrder": 1,
      "colors": [
        {
          "colorName": "Natural Titanium",
          "colorCode": "#8D8D8D",
          "displayOrder": 1,
          "storages": [
            {
              "storageSize": "256GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 1299,
                "comparePrice": 1399,
                "discountPrice": 1249,
                "discountPercent": 10,
                "campaignPrice": 1199,
                "campaignStart": "2025-12-01T00:00:00Z",
                "campaignEnd": "2025-12-31T23:59:59Z",
                "stockQuantity": 50,
                "lowStockAlert": 5
              }
            },
            {
              "storageSize": "512GB",
              "displayOrder": 2,
              "price": {
                "regularPrice": 1499,
                "comparePrice": 1599,
                "discountPrice": 1449,
                "discountPercent": 10,
                "stockQuantity": 30,
                "lowStockAlert": 5
              }
            }
          ]
        },
        {
          "colorName": "Blue Titanium",
          "colorCode": "#2D4F6C",
          "displayOrder": 2,
          "storages": [
            {
              "storageSize": "256GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 1299,
                "stockQuantity": 40,
                "lowStockAlert": 5
              }
            }
          ]
        }
      ]
    },
    {
      "regionName": "UAE",
      "isDefault": false,
      "displayOrder": 2,
      "colors": [
        {
          "colorName": "Natural Titanium",
          "colorCode": "#8D8D8D",
          "displayOrder": 1,
          "storages": [
            {
              "storageSize": "256GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 4799,
                "stockQuantity": 25,
                "lowStockAlert": 3
              }
            }
          ]
        }
      ]
    }
  ],
  "specifications": [
    {
      "groupName": "Display",
      "displayOrder": 1,
      "icon": "display-icon",
      "specs": [
        {
          "specKey": "Screen Size",
          "specValue": "6.7 inches",
          "displayOrder": 1
        },
        {
          "specKey": "Resolution",
          "specValue": "2796 x 1290 pixels",
          "displayOrder": 2
        },
        {
          "specKey": "Technology",
          "specValue": "Super Retina XDR OLED",
          "displayOrder": 3
        }
      ]
    },
    {
      "groupName": "Platform",
      "displayOrder": 2,
      "icon": "cpu-icon",
      "specs": [
        {
          "specKey": "Chipset",
          "specValue": "Apple A17 Pro",
          "displayOrder": 1
        },
        {
          "specKey": "CPU",
          "specValue": "6-core (2x3.78 GHz + 4x2.11 GHz)",
          "displayOrder": 2
        },
        {
          "specKey": "GPU",
          "specValue": "6-core GPU",
          "displayOrder": 3
        }
      ]
    },
    {
      "groupName": "Camera",
      "displayOrder": 3,
      "icon": "camera-icon",
      "specs": [
        {
          "specKey": "Main Camera",
          "specValue": "48 MP, f/1.8, 24mm (wide)",
          "displayOrder": 1
        },
        {
          "specKey": "Telephoto",
          "specValue": "12 MP, f/2.8, 120mm",
          "displayOrder": 2
        },
        {
          "specKey": "Front Camera",
          "specValue": "12 MP, f/1.9",
          "displayOrder": 3
        }
      ]
    },
    {
      "groupName": "Battery",
      "displayOrder": 4,
      "icon": "battery-icon",
      "specs": [
        {
          "specKey": "Type",
          "specValue": "Li-Ion 4422 mAh, non-removable",
          "displayOrder": 1
        },
        {
          "specKey": "Charging",
          "specValue": "27W wired, 15W wireless (MagSafe)",
          "displayOrder": 2
        }
      ]
    }
  ]
}
```

### GET /products/:slug - Product Details Response

```json
{
  "id": "uuid",
  "name": "iPhone 15 Pro Max",
  "slug": "iphone-15-pro-max",
  "description": "Latest flagship phone with A17 Pro chip",
  "category": {
    "id": "uuid",
    "name": "Mobile Phones"
  },
  "brand": {
    "id": "uuid",
    "name": "Apple"
  },
  "productCode": "IPHONE15PM",
  "sku": "IPH-15-PM-001",
  "warranty": "1 Year Official Warranty",
  "isActive": true,
  "isOnline": true,
  "isPos": true,
  "isPreOrder": false,
  "isOfficial": true,
  "freeShipping": true,
  "rewardPoints": 1500,
  "minBookingPrice": 0,
  "seo": {
    "title": "Buy iPhone 15 Pro Max - Best Price",
    "description": "Shop iPhone 15 Pro Max with free shipping",
    "keywords": ["iphone", "apple", "flagship"],
    "canonical": "https://example.com/products/iphone-15-pro-max"
  },
  "tags": ["flagship", "premium", "5g"],
  "images": [
    {
      "id": "uuid",
      "url": "https://cdn.example.com/iphone-1.jpg",
      "isThumbnail": true,
      "altText": "iPhone 15 Pro Max Front"
    }
  ],
  "videos": [
    {
      "id": "uuid",
      "url": "https://youtube.com/watch?v=xxx",
      "type": "youtube"
    }
  ],
  "priceRange": {
    "min": 1199,
    "max": 4799,
    "currency": "USD"
  },
  "totalStock": 145,
  "regions": [
    {
      "id": "uuid",
      "name": "International",
      "isDefault": true,
      "colors": [
        {
          "id": "uuid",
          "name": "Natural Titanium",
          "code": "#8D8D8D",
          "storages": [
            {
              "id": "uuid",
              "size": "256GB",
              "price": {
                "regular": 1299,
                "compare": 1399,
                "discount": 1249,
                "discountPercent": 10,
                "campaign": 1199,
                "campaignActive": true,
                "final": 1199
              },
              "stock": 50,
              "inStock": true
            }
          ]
        }
      ]
    }
  ],
  "specifications": [
    {
      "group": "Display",
      "icon": "display-icon",
      "specs": [
        {
          "key": "Screen Size",
          "value": "6.7 inches"
        },
        {
          "key": "Resolution",
          "value": "2796 x 1290 pixels"
        }
      ]
    }
  ],
  "createdAt": "2025-12-01T00:00:00Z",
  "updatedAt": "2025-12-01T00:00:00Z"
}
```

## Key Features

1. **Normalized Database**: No data duplication, atomic tables
2. **Transactional Inserts**: Single API call with rollback support
3. **Dynamic Specifications**: Group-based, future-proof
4. **Hierarchical Pricing**: Region → Color → Storage → Price
5. **Stock Management**: Per-variant stock tracking
6. **SEO Optimized**: Complete meta tags support
7. **Multi-channel**: POS + Online visibility flags
8. **Campaign Pricing**: Time-based promotional prices
9. **Soft Delete**: Data retention with deleted_at
10. **Scalable**: Handles millions of products efficiently
