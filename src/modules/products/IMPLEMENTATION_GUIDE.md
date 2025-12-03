# International E-Commerce Product Module - Implementation Guide

## 🎯 Overview

This is an enterprise-grade, international-standard E-Commerce Product Module designed following Amazon, Dazzle, and Daraz best practices. It supports complex product variants, dynamic pricing, specifications, and multi-channel sales.

## ✨ Key Features

- **Single API Transaction**: Create complete product with all data in one request
- **Hierarchical Variants**: Region → Color → Storage → Price
- **Dynamic Specifications**: Group-based specs without schema changes
- **Multi-Channel Support**: POS + Online visibility flags
- **Campaign Pricing**: Time-based promotional pricing
- **Stock Management**: Per-variant stock with low stock alerts
- **SEO Optimized**: Complete meta tags support
- **Soft Delete**: Data retention with deleted_at
- **Transaction Safety**: All inserts use database transactions
- **UUID Primary Keys**: Scalable for distributed systems

## 📊 Database Architecture

### Tables Created:
1. **products** - Main product information
2. **product_regions** - Regional/variant types
3. **product_colors** - Color variants per region
4. **product_storages** - Storage/size variants per color
5. **product_prices** - Pricing and stock per storage
6. **product_images** - Product images
7. **product_videos** - Product videos
8. **spec_groups** - Specification groups (Display, Camera, etc.)
9. **product_specifications** - Product specifications

### Relationships:
```
Product (1) → (N) ProductRegions
ProductRegion (1) → (N) ProductColors
ProductColor (1) → (N) ProductStorages
ProductStorage (1) → (1) ProductPrice

Product (1) → (N) ProductImages
Product (1) → (N) ProductVideos
Product (1) → (N) ProductSpecifications
SpecGroup (1) → (N) ProductSpecifications
```

## 🚀 Getting Started

### 1. Run Migration

```bash
npm run typeorm migration:run
```

This will create all tables and insert default specification groups.

### 2. API Endpoints

#### Create Product
```
POST /products-new
Headers: Authorization: Bearer <token>
Roles: admin, management
```

#### Get All Products
```
GET /products-new?categoryId=xxx&brandId=xxx&search=xxx&limit=50&offset=0
```

#### Get Product by Slug
```
GET /products-new/:slug
```

#### Get Variant Price
```
GET /products-new/:productId/variant-price?regionId=xxx&colorId=xxx&storageId=xxx
```

#### Update Product
```
PATCH /products-new/:id
Headers: Authorization: Bearer <token>
Roles: admin, management
```

#### Delete Product (Soft)
```
DELETE /products-new/:id
Headers: Authorization: Bearer <token>
Roles: admin
```

#### Search Products
```
GET /products-new/search?q=iphone
```

## 📝 Request Example

### Create iPhone 15 Pro Max

```json
{
  "name": "iPhone 15 Pro Max",
  "slug": "iphone-15-pro-max",
  "description": "Latest flagship phone with A17 Pro chip and titanium design",
  "categoryId": "uuid-mobile-category",
  "brandId": "uuid-apple-brand",
  "productCode": "IPHONE15PM",
  "sku": "IPH-15-PM-001",
  "warranty": "1 Year Official Apple Warranty",
  "isActive": true,
  "isOnline": true,
  "isPos": true,
  "isPreOrder": false,
  "isOfficial": true,
  "freeShipping": true,
  "rewardPoints": 1500,
  "minBookingPrice": 0,
  "seoTitle": "Buy iPhone 15 Pro Max - Best Price & Free Shipping",
  "seoDescription": "Shop iPhone 15 Pro Max with official warranty. Get the best price and free shipping on all orders.",
  "seoKeywords": ["iphone", "apple", "flagship", "a17 pro", "titanium"],
  "seoCanonical": "https://yourstore.com/products/iphone-15-pro-max",
  "tags": ["flagship", "premium", "5g", "new-arrival"],
  "images": [
    {
      "imageUrl": "https://cdn.yourstore.com/iphone-15-pro-max-front.jpg",
      "isThumbnail": true,
      "altText": "iPhone 15 Pro Max Natural Titanium Front View",
      "displayOrder": 1
    },
    {
      "imageUrl": "https://cdn.yourstore.com/iphone-15-pro-max-back.jpg",
      "isThumbnail": false,
      "altText": "iPhone 15 Pro Max Natural Titanium Back View",
      "displayOrder": 2
    }
  ],
  "videos": [
    {
      "videoUrl": "https://youtube.com/watch?v=xxxxxxxxxxx",
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
                "regularPrice": 1299.99,
                "comparePrice": 1399.99,
                "discountPrice": 1249.99,
                "discountPercent": 10,
                "campaignPrice": 1199.99,
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
                "regularPrice": 1499.99,
                "comparePrice": 1599.99,
                "discountPrice": 1449.99,
                "discountPercent": 10,
                "stockQuantity": 30,
                "lowStockAlert": 5
              }
            },
            {
              "storageSize": "1TB",
              "displayOrder": 3,
              "price": {
                "regularPrice": 1699.99,
                "stockQuantity": 20,
                "lowStockAlert": 3
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
                "regularPrice": 1299.99,
                "stockQuantity": 40,
                "lowStockAlert": 5
              }
            },
            {
              "storageSize": "512GB",
              "displayOrder": 2,
              "price": {
                "regularPrice": 1499.99,
                "stockQuantity": 25,
                "lowStockAlert": 5
              }
            }
          ]
        },
        {
          "colorName": "White Titanium",
          "colorCode": "#F5F5F5",
          "displayOrder": 3,
          "storages": [
            {
              "storageSize": "256GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 1299.99,
                "stockQuantity": 35,
                "lowStockAlert": 5
              }
            }
          ]
        },
        {
          "colorName": "Black Titanium",
          "colorCode": "#1C1C1C",
          "displayOrder": 4,
          "storages": [
            {
              "storageSize": "256GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 1299.99,
                "stockQuantity": 45,
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
            },
            {
              "storageSize": "512GB",
              "displayOrder": 2,
              "price": {
                "regularPrice": 5499,
                "stockQuantity": 15,
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
          "specValue": "6.7 inches, 110.2 cm2 (~89.8% screen-to-body ratio)",
          "displayOrder": 1
        },
        {
          "specKey": "Resolution",
          "specValue": "1290 x 2796 pixels, 19.5:9 ratio (~460 ppi density)",
          "displayOrder": 2
        },
        {
          "specKey": "Technology",
          "specValue": "LTPO Super Retina XDR OLED, 120Hz, HDR10, Dolby Vision",
          "displayOrder": 3
        },
        {
          "specKey": "Protection",
          "specValue": "Ceramic Shield glass",
          "displayOrder": 4
        }
      ]
    },
    {
      "groupName": "Platform",
      "displayOrder": 2,
      "icon": "cpu-icon",
      "specs": [
        {
          "specKey": "OS",
          "specValue": "iOS 17, upgradable to iOS 18",
          "displayOrder": 1
        },
        {
          "specKey": "Chipset",
          "specValue": "Apple A17 Pro (3 nm)",
          "displayOrder": 2
        },
        {
          "specKey": "CPU",
          "specValue": "Hexa-core (2x3.78 GHz + 4x2.11 GHz)",
          "displayOrder": 3
        },
        {
          "specKey": "GPU",
          "specValue": "Apple GPU (6-core graphics)",
          "displayOrder": 4
        }
      ]
    },
    {
      "groupName": "Memory",
      "displayOrder": 3,
      "icon": "memory-icon",
      "specs": [
        {
          "specKey": "Card Slot",
          "specValue": "No",
          "displayOrder": 1
        },
        {
          "specKey": "Internal",
          "specValue": "256GB 8GB RAM, 512GB 8GB RAM, 1TB 8GB RAM",
          "displayOrder": 2
        },
        {
          "specKey": "Storage Type",
          "specValue": "NVMe",
          "displayOrder": 3
        }
      ]
    },
    {
      "groupName": "Camera",
      "displayOrder": 4,
      "icon": "camera-icon",
      "specs": [
        {
          "specKey": "Main Camera",
          "specValue": "48 MP, f/1.8, 24mm (wide), 1/1.28\", 1.22µm, dual pixel PDAF, sensor-shift OIS",
          "displayOrder": 1
        },
        {
          "specKey": "Periscope Telephoto",
          "specValue": "12 MP, f/2.8, 120mm (periscope telephoto), 1/3.06\", 1.12µm, dual pixel PDAF, 3D sensor‑shift OIS, 5x optical zoom",
          "displayOrder": 2
        },
        {
          "specKey": "Ultra Wide",
          "specValue": "12 MP, f/2.2, 13mm, 120˚ (ultrawide), 1/2.55\", 1.4µm, dual pixel PDAF",
          "displayOrder": 3
        },
        {
          "specKey": "Front Camera",
          "specValue": "12 MP, f/1.9, 23mm (wide), 1/3.6\", PDAF",
          "displayOrder": 4
        },
        {
          "specKey": "Video",
          "specValue": "4K@24/25/30/60fps, 1080p@25/30/60/120/240fps, 10-bit HDR, Dolby Vision HDR, ProRes, Cinematic mode (4K@30fps)",
          "displayOrder": 5
        }
      ]
    },
    {
      "groupName": "Battery",
      "displayOrder": 5,
      "icon": "battery-icon",
      "specs": [
        {
          "specKey": "Type",
          "specValue": "Li-Ion 4422 mAh, non-removable",
          "displayOrder": 1
        },
        {
          "specKey": "Wired Charging",
          "specValue": "50% in 30 min (advertised), 27W wired",
          "displayOrder": 2
        },
        {
          "specKey": "Wireless Charging",
          "specValue": "15W wireless (MagSafe), 7.5W wireless (Qi)",
          "displayOrder": 3
        }
      ]
    },
    {
      "groupName": "Network",
      "displayOrder": 6,
      "icon": "network-icon",
      "specs": [
        {
          "specKey": "Technology",
          "specValue": "GSM / CDMA / HSPA / EVDO / LTE / 5G",
          "displayOrder": 1
        },
        {
          "specKey": "5G Bands",
          "specValue": "1, 2, 3, 5, 7, 8, 12, 20, 25, 26, 28, 30, 38, 40, 41, 48, 53, 66, 70, 77, 78, 79 SA/NSA/Sub6",
          "displayOrder": 2
        },
        {
          "specKey": "Speed",
          "specValue": "HSPA, LTE-A, 5G, EV-DO Rev.A 3.1 Mbps",
          "displayOrder": 3
        }
      ]
    },
    {
      "groupName": "Connectivity",
      "displayOrder": 7,
      "icon": "wifi-icon",
      "specs": [
        {
          "specKey": "WLAN",
          "specValue": "Wi-Fi 802.11 a/b/g/n/ac/6e, dual-band, hotspot",
          "displayOrder": 1
        },
        {
          "specKey": "Bluetooth",
          "specValue": "5.3, A2DP, LE",
          "displayOrder": 2
        },
        {
          "specKey": "USB",
          "specValue": "USB Type-C 3.0, DisplayPort",
          "displayOrder": 3
        },
        {
          "specKey": "NFC",
          "specValue": "Yes",
          "displayOrder": 4
        }
      ]
    },
    {
      "groupName": "Body",
      "displayOrder": 8,
      "icon": "phone-icon",
      "specs": [
        {
          "specKey": "Dimensions",
          "specValue": "159.9 x 76.7 x 8.3 mm (6.30 x 3.02 x 0.33 in)",
          "displayOrder": 1
        },
        {
          "specKey": "Weight",
          "specValue": "221 g (7.80 oz)",
          "displayOrder": 2
        },
        {
          "specKey": "Build",
          "specValue": "Glass front (Ceramic Shield), glass back (matte finish), titanium frame (grade 5)",
          "displayOrder": 3
        },
        {
          "specKey": "Water Resistance",
          "specValue": "IP68 dust/water resistant (up to 6m for 30 min)",
          "displayOrder": 4
        }
      ]
    },
    {
      "groupName": "Sound",
      "displayOrder": 9,
      "icon": "speaker-icon",
      "specs": [
        {
          "specKey": "Loudspeaker",
          "specValue": "Yes, with stereo speakers",
          "displayOrder": 1
        },
        {
          "specKey": "3.5mm Jack",
          "specValue": "No",
          "displayOrder": 2
        }
      ]
    },
    {
      "groupName": "Sensors",
      "displayOrder": 10,
      "icon": "sensor-icon",
      "specs": [
        {
          "specKey": "Sensors",
          "specValue": "Face ID, accelerometer, gyro, proximity, compass, barometer, Ultra Wideband 2 (UWB) support, Emergency SOS via satellite",
          "displayOrder": 1
        }
      ]
    },
    {
      "groupName": "Features",
      "displayOrder": 11,
      "icon": "star-icon",
      "specs": [
        {
          "specKey": "Action Button",
          "specValue": "Customizable action button",
          "displayOrder": 1
        },
        {
          "specKey": "Always-On Display",
          "specValue": "Yes",
          "displayOrder": 2
        },
        {
          "specKey": "Dynamic Island",
          "specValue": "Yes",
          "displayOrder": 3
        }
      ]
    }
  ]
}
```

## 📤 Response Example

### GET /products-new/iphone-15-pro-max

```json
{
  "id": "uuid",
  "name": "iPhone 15 Pro Max",
  "slug": "iphone-15-pro-max",
  "description": "Latest flagship phone with A17 Pro chip and titanium design",
  "categoryId": "uuid",
  "brandId": "uuid",
  "productCode": "IPHONE15PM",
  "sku": "IPH-15-PM-001",
  "warranty": "1 Year Official Apple Warranty",
  "isActive": true,
  "isOnline": true,
  "isPos": true,
  "isPreOrder": false,
  "isOfficial": true,
  "freeShipping": true,
  "rewardPoints": 1500,
  "minBookingPrice": 0,
  "seo": {
    "title": "Buy iPhone 15 Pro Max - Best Price & Free Shipping",
    "description": "Shop iPhone 15 Pro Max with official warranty...",
    "keywords": ["iphone", "apple", "flagship"],
    "canonical": "https://yourstore.com/products/iphone-15-pro-max"
  },
  "tags": ["flagship", "premium", "5g"],
  "priceRange": {
    "min": 1199.99,
    "max": 5499,
    "currency": "USD"
  },
  "totalStock": 305,
  "images": [
    {
      "id": "uuid",
      "url": "https://cdn.yourstore.com/iphone-15-pro-max-front.jpg",
      "isThumbnail": true,
      "altText": "iPhone 15 Pro Max Natural Titanium Front View"
    }
  ],
  "videos": [
    {
      "id": "uuid",
      "url": "https://youtube.com/watch?v=xxxxxxxxxxx",
      "type": "youtube"
    }
  ],
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
                "regular": 1299.99,
                "compare": 1399.99,
                "discount": 1249.99,
                "discountPercent": 10,
                "campaign": 1199.99,
                "campaignActive": true,
                "final": 1199.99
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
          "value": "6.7 inches, 110.2 cm2 (~89.8% screen-to-body ratio)"
        }
      ]
    }
  ],
  "createdAt": "2025-12-03T00:00:00Z",
  "updatedAt": "2025-12-03T00:00:00Z"
}
```

## 🔍 Query Variant Price

### GET /products-new/{productId}/variant-price?regionId=xxx&colorId=xxx&storageId=xxx

```json
{
  "region": {
    "id": "uuid",
    "name": "International"
  },
  "color": {
    "id": "uuid",
    "name": "Natural Titanium",
    "code": "#8D8D8D"
  },
  "storage": {
    "id": "uuid",
    "size": "256GB"
  },
  "price": {
    "regular": 1299.99,
    "compare": 1399.99,
    "discount": 1249.99,
    "discountPercent": 10,
    "campaign": 1199.99,
    "campaignActive": true,
    "final": 1199.99
  },
  "stock": {
    "quantity": 50,
    "lowStockAlert": 5,
    "inStock": true,
    "isLowStock": false
  }
}
```

## 🛠️ Technology Stack

- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL (recommended) / MySQL
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger
- **Authentication**: JWT with role-based access control

## 📈 Scalability Features

1. **UUID Primary Keys**: Distributed system friendly
2. **Indexed Queries**: All foreign keys and search fields indexed
3. **Normalized Schema**: No data duplication
4. **Soft Delete**: Data retention for analytics
5. **Transaction Support**: ACID compliance
6. **Eager/Lazy Loading**: Optimized queries with relations
7. **Pagination**: Limit/offset support

## 🔐 Security

- JWT Authentication required for CREATE, UPDATE, DELETE
- Role-based access control (Admin, Management)
- Input validation with DTOs
- SQL injection prevention via TypeORM
- Soft delete instead of hard delete

## 🎨 Frontend Integration

The API response is structured for easy frontend integration:

```typescript
// Price calculation logic (automatic)
const finalPrice = campaignActive ? campaignPrice : (discountPrice || regularPrice);

// Stock status
const inStock = stockQuantity > 0;
const isLowStock = stockQuantity <= lowStockAlert;

// Price range display
const minPrice = Math.min(...allPrices);
const maxPrice = Math.max(...allPrices);
```

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Built with ❤️ following Amazon, Dazzle & Daraz best practices**
