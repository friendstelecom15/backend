# Network Variant Feature Documentation

## Overview
Some products (like iPads) have different prices based on network connectivity options:
- **WiFi only** - Lower price
- **WiFi + Cellular** - Higher price (includes 5G/LTE support)

This feature is **extremely flexible** and supports:
1. **Network → Color → Storage → Price** (Network affects all variants)
2. **Color → Network-specific Storage → Price** (Each network has different storage pricing)
3. **Network → Storage → Color → Price** (Network + Storage combination affects color pricing)

---

## Database Structure

### ProductNetwork Entity
```typescript
{
  id: ObjectId,
  productId: ObjectId,
  networkType: string,        // 'WiFi', 'WiFi+ Cellular'
  isDefault: boolean,
  displayOrder: number,
  priceAdjustment: number,     // Optional: price difference from base
  colors: ProductColor[]
}
```

### ProductColor Entity (Updated)
```typescript
{
  id: ObjectId,
  productId: ObjectId,         // Direct product (no region/network)
  regionId: ObjectId,          // For region-based variants
  networkId: ObjectId,         // For network-based variants (NEW)
  colorName: string,
  colorImage: string,
  hasStorage: boolean,
  storages: ProductStorage[]
}
```

---

## Architecture Flexibility

### Scenario 1: Network → Color → Storage (Network affects ALL variants)
```
Product (iPad)
  ├─ Network: WiFi
  │   ├─ Color: Blue
  │   │   ├─ Storage: 8/256GB → BDT 109,990
  │   │   └─ Storage: 8/512GB → BDT 134,990
  │   └─ Color: Purple
  │       └─ Storage: 8/256GB → BDT 109,990
  └─ Network: WiFi+Cellular
      ├─ Color: Blue
      │   ├─ Storage: 8/256GB → BDT 124,990 (+15K)
      │   └─ Storage: 8/512GB → BDT 149,990 (+15K)
      └─ Color: Purple
          └─ Storage: 8/256GB → BDT 124,990 (+15K)
```

### Scenario 2: Color → Storage (with networkId) → Price
```
Product (iPad)
  └─ Color: Starlight
      ├─ Storage: 8/256GB [networkId: WiFi] → BDT 109,990
      ├─ Storage: 8/256GB [networkId: Cellular] → BDT 124,990
      ├─ Storage: 8/512GB [networkId: WiFi] → BDT 134,990
      └─ Storage: 8/512GB [networkId: Cellular] → BDT 149,990
```

Both approaches work! Choose based on your use case.

---

## API Request Example

### Approach 1: Network → Color → Storage (Recommended for iPads)

```json
{
  "name": "Apple iPad Air M3 13 inch (2025)",
  "slug": "apple-ipad-air-m3-13-inch-2025",
  "description": "The iPad Air M3 13-inch (2025) features the powerful M3 chip...",
  "categoryId": "507f1f77bcf86cd799439011",
  "brandId": "507f1f77bcf86cd799439012",
  "productCode": "IPAD-AIR-M3-13",
  "sku": "IPAD-M3-13-2025",
  "warranty": "1 Year Apple International Warranty",
  "isActive": true,
  "isOnline": true,
  "isOfficial": true,
  "freeShipping": false,
  "rewardPoints": 400,
  "minBookingPrice": 5000,
  "seoTitle": "iPad Air M3 13 Inch Price in Bangladesh",
  "seoDescription": "Discover the iPad Air M3 13-inch in Bangladesh...",
  "seoKeywords": ["ipad air m3", "ipad air 13 inch", "apple ipad"],
  "tags": ["flagship", "premium", "tablet"],
  
  "networks": [
    {
      "networkType": "WiFi",
      "isDefault": true,
      "displayOrder": 1,
      "colors": [
        {
          "colorName": "Starlight",
          "colorImage": "https://cdn.example.com/starlight.jpg",
          "hasStorage": true,
          "displayOrder": 1,
          "storages": [
            {
              "storageSize": "8/128GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 94990,
                "comparePrice": 109990,
                "stockQuantity": 10,
                "lowStockAlert": 3
              }
            },
            {
              "storageSize": "8/256GB",
              "displayOrder": 2,
              "price": {
                "regularPrice": 109990,
                "comparePrice": 124990,
                "stockQuantity": 15,
                "lowStockAlert": 3
              }
            },
            {
              "storageSize": "8/512GB",
              "displayOrder": 3,
              "price": {
                "regularPrice": 134990,
                "comparePrice": 149990,
                "stockQuantity": 8,
                "lowStockAlert": 2
              }
            },
            {
              "storageSize": "8/1TB",
              "displayOrder": 4,
              "price": {
                "regularPrice": 164990,
                "comparePrice": 179990,
                "stockQuantity": 5,
                "lowStockAlert": 2
              }
            }
          ]
        },
        {
          "colorName": "Blue",
          "colorImage": "https://cdn.example.com/blue.jpg",
          "hasStorage": true,
          "displayOrder": 2,
          "storages": [
            {
              "storageSize": "8/128GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 94990,
                "comparePrice": 109990,
                "stockQuantity": 12,
                "lowStockAlert": 3
              }
            },
            {
              "storageSize": "8/256GB",
              "displayOrder": 2,
              "price": {
                "regularPrice": 109990,
                "comparePrice": 124990,
                "stockQuantity": 8,
                "lowStockAlert": 3
              }
            }
          ]
        },
        {
          "colorName": "Purple",
          "colorImage": "https://cdn.example.com/purple.jpg",
          "hasStorage": true,
          "displayOrder": 3,
          "storages": [
            {
              "storageSize": "8/128GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 94990,
                "comparePrice": 109990,
                "stockQuantity": 7,
                "lowStockAlert": 3
              }
            }
          ]
        },
        {
          "colorName": "Space Gray",
          "colorImage": "https://cdn.example.com/space-gray.jpg",
          "hasStorage": true,
          "displayOrder": 4,
          "storages": [
            {
              "storageSize": "8/256GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 109990,
                "comparePrice": 124990,
                "stockQuantity": 10,
                "lowStockAlert": 3
              }
            }
          ]
        }
      ]
    },
    {
      "networkType": "WiFi+ Cellular",
      "isDefault": false,
      "displayOrder": 2,
      "priceAdjustment": 15000,
      "colors": [
        {
          "colorName": "Starlight",
          "colorImage": "https://cdn.example.com/starlight.jpg",
          "hasStorage": true,
          "displayOrder": 1,
          "storages": [
            {
              "storageSize": "8/128GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 109990,
                "comparePrice": 124990,
                "stockQuantity": 8,
                "lowStockAlert": 3
              }
            },
            {
              "storageSize": "8/256GB",
              "displayOrder": 2,
              "price": {
                "regularPrice": 124990,
                "comparePrice": 139990,
                "stockQuantity": 10,
                "lowStockAlert": 3
              }
            },
            {
              "storageSize": "8/512GB",
              "displayOrder": 3,
              "price": {
                "regularPrice": 149990,
                "comparePrice": 164990,
                "stockQuantity": 5,
                "lowStockAlert": 2
              }
            },
            {
              "storageSize": "8/1TB",
              "displayOrder": 4,
              "price": {
                "regularPrice": 179990,
                "comparePrice": 194990,
                "stockQuantity": 3,
                "lowStockAlert": 2
              }
            }
          ]
        },
        {
          "colorName": "Blue",
          "colorImage": "https://cdn.example.com/blue.jpg",
          "hasStorage": true,
          "displayOrder": 2,
          "storages": [
            {
              "storageSize": "8/256GB",
              "displayOrder": 1,
              "price": {
                "regularPrice": 124990,
                "comparePrice": 139990,
                "stockQuantity": 6,
                "lowStockAlert": 3
              }
            }
          ]
        }
      ]
    }
  ],
  
  "images": [
    {
      "imageUrl": "https://cdn.example.com/ipad-air-m3-1.jpg",
      "isThumbnail": true,
      "altText": "iPad Air M3 13 inch Front View",
      "displayOrder": 1
    },
    {
      "imageUrl": "https://cdn.example.com/ipad-air-m3-2.jpg",
      "isThumbnail": false,
      "altText": "iPad Air M3 13 inch Side View",
      "displayOrder": 2
    }
  ],
  
  "specifications": [
    {
      "groupName": "Display",
      "displayOrder": 1,
      "icon": "display-icon",
      "specs": [
        {
          "specKey": "Size",
          "specValue": "13.0\" Liquid Retina IPS LCD, 2048 x 2732 pixels, 600 nits",
          "displayOrder": 1
        },
        {
          "specKey": "Type",
          "specValue": "Liquid Retina IPS LCD, 120Hz, HDR10",
          "displayOrder": 2
        }
      ]
    },
    {
      "groupName": "Processor",
      "displayOrder": 2,
      "specs": [
        {
          "specKey": "Chip",
          "specValue": "Apple M3 chip with 9-core GPU for seamless performance",
          "displayOrder": 1
        }
      ]
    },
    {
      "groupName": "Camera",
      "displayOrder": 3,
      "specs": [
        {
          "specKey": "Rear",
          "specValue": "12MP rear (HDR, 4K video), 12MP ultrawide selfie camera",
          "displayOrder": 1
        }
      ]
    },
    {
      "groupName": "Battery",
      "displayOrder": 4,
      "specs": [
        {
          "specKey": "Capacity",
          "specValue": "9705mAh (36.59 Wh) for all-day usage",
          "displayOrder": 1
        }
      ]
    },
    {
      "groupName": "Connectivity",
      "displayOrder": 5,
      "specs": [
        {
          "specKey": "Network",
          "specValue": "Wi-Fi 6E, 5G (cellular model), USB-C 3.1, eSIM support",
          "displayOrder": 1
        }
      ]
    }
  ],
  
  "faqIds": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
}
```

---

## Frontend Display Logic

### 1. Show Network Selection Buttons
```typescript
// Get unique network types
const networks = product.networks; // [{ networkType: 'WiFi', ... }, { networkType: 'WiFi+ Cellular', ... }]

// Display as buttons
<NetworkSelector>
  {networks.map(network => (
    <NetworkButton 
      key={network.id}
      selected={selectedNetwork === network.id}
      onClick={() => setSelectedNetwork(network.id)}
    >
      {network.networkType}
    </NetworkButton>
  ))}
</NetworkSelector>
```

### 2. Filter Colors by Selected Network
```typescript
const selectedNetworkColors = product.networks
  .find(n => n.id === selectedNetwork)?.colors || [];
```

### 3. Get Price for Selected Variant
```typescript
const price = selectedNetworkColors
  .find(c => c.id === selectedColor)
  ?.storages.find(s => s.id === selectedStorage)
  ?.price.regularPrice;
```

---

## Database Queries

### Get Product with Network Variants
```typescript
const product = await productRepository.findOne({
  where: { slug: 'apple-ipad-air-m3-13-inch-2025' },
  relations: [
    'networks',
    'networks.colors',
    'networks.colors.storages',
    'networks.colors.storages.price',
    'images',
    'specifications',
  ],
});
```

### Get Lowest Price Across All Networks
```typescript
const prices = product.networks
  .flatMap(n => n.colors)
  .flatMap(c => c.storages)
  .map(s => s.price.regularPrice)
  .sort((a, b) => a - b);

const lowestPrice = prices[0]; // e.g., 94990
```

---

## Use Cases

### ✅ iPad with WiFi vs WiFi+Cellular
- **WiFi**: 8/256GB @ BDT 109,990
- **WiFi+Cellular**: 8/256GB @ BDT 124,990

### ✅ Samsung Galaxy Tab with Network Options
- **WiFi**: Lower price
- **WiFi+4G**: Mid price
- **WiFi+5G**: Higher price

### ✅ Apple Watch Variants
- **GPS Only**: Base price
- **GPS + Cellular**: Premium price

---

## Migration Notes

### For Existing Products
1. Products without network variants continue to work as before
2. Use `regions` for regional variants (e.g., China vs Global)
3. Use `networks` for connectivity variants (e.g., WiFi vs Cellular)
4. Use `directColors` for simple products without variants

### Multiple Variant Types
You can combine:
- **Region + Network**: iPhone China WiFi, iPhone China Cellular, iPhone Global WiFi, etc.
- **Network + Color + Storage**: iPad WiFi Blue 256GB, iPad Cellular Blue 256GB, etc.

---

## API Response Format

```json
{
  "id": "507f1f77bcf86cd799439015",
  "name": "Apple iPad Air M3 13 inch (2025)",
  "slug": "apple-ipad-air-m3-13-inch-2025",
  "networks": [
    {
      "id": "507f1f77bcf86cd799439016",
      "networkType": "WiFi",
      "isDefault": true,
      "displayOrder": 1,
      "colors": [
        {
          "id": "507f1f77bcf86cd799439017",
          "colorName": "Starlight",
          "colorImage": "https://cdn.example.com/starlight.jpg",
          "hasStorage": true,
          "storages": [
            {
              "id": "507f1f77bcf86cd799439018",
              "storageSize": "8/256GB",
              "price": {
                "regularPrice": 109990,
                "comparePrice": 124990,
                "stockQuantity": 15
              }
            }
          ]
        }
      ]
    },
    {
      "id": "507f1f77bcf86cd799439019",
      "networkType": "WiFi+ Cellular",
      "isDefault": false,
      "displayOrder": 2,
      "priceAdjustment": 15000,
      "colors": [...]
    }
  ],
  "minPrice": 94990,
  "maxPrice": 179990
}
```

---

---

## Approach 2: Storage with NetworkId (Alternative Method)

If you want to store all colors together but vary storage pricing by network:

```json
{
  "name": "Apple iPad Air M3 13 inch (2025)",
  "slug": "apple-ipad-air-m3-13-inch-2025",
  "directColors": [
    {
      "colorName": "Starlight",
      "colorImage": "https://cdn.example.com/starlight.jpg",
      "hasStorage": true,
      "storages": [
        {
          "storageSize": "8/256GB",
          "networkId": null,
          "displayOrder": 1,
          "price": {
            "regularPrice": 109990,
            "comparePrice": 124990,
            "stockQuantity": 15
          }
        },
        {
          "storageSize": "8/256GB",
          "networkId": "507f1f77bcf86cd799439020",
          "displayOrder": 2,
          "price": {
            "regularPrice": 124990,
            "comparePrice": 139990,
            "stockQuantity": 10
          }
        },
        {
          "storageSize": "8/512GB",
          "networkId": null,
          "displayOrder": 3,
          "price": {
            "regularPrice": 134990,
            "comparePrice": 149990,
            "stockQuantity": 8
          }
        },
        {
          "storageSize": "8/512GB",
          "networkId": "507f1f77bcf86cd799439020",
          "displayOrder": 4,
          "price": {
            "regularPrice": 149990,
            "comparePrice": 164990,
            "stockQuantity": 5
          }
        }
      ]
    }
  ],
  "networks": [
    {
      "networkType": "WiFi",
      "isDefault": true,
      "displayOrder": 1
    },
    {
      "id": "507f1f77bcf86cd799439020",
      "networkType": "WiFi+ Cellular",
      "isDefault": false,
      "displayOrder": 2
    }
  ]
}
```

**Query for this approach:**
```typescript
// Get all storages for a color filtered by network
const storagesForNetwork = color.storages.filter(s => {
  return selectedNetwork === 'wifi' 
    ? s.networkId === null 
    : s.networkId === selectedNetworkId;
});
```

---

## Summary

✅ **New Entity**: `ProductNetwork` for WiFi/Cellular variants  
✅ **Updated Entity**: `ProductColor` now supports `networkId`  
✅ **Updated Entity**: `ProductStorage` now supports `networkId` for network-specific pricing  
✅ **New DTO**: `CreateProductNetworkDto` for API requests  
✅ **Flexible**: Works alongside existing region/color/storage system  
✅ **Multiple Approaches**: Choose Network→Color→Storage OR Color→Storage(networkId)  
✅ **UI-Ready**: Easy to render network selection buttons  
✅ **Price Variance**: Each network type can have different prices per RAM/storage/color  

### Architecture Supports:
- ✅ Network affects ALL variants (Approach 1)
- ✅ Network affects ONLY storage pricing (Approach 2)
- ✅ Network affects ONLY color pricing
- ✅ Combination of Region + Network + Color + Storage

This architecture allows you to handle complex product variants like Dazzle's iPad example with network-based pricing! 🚀

**হ্যাঁ, এখন সব ধরনের scenario কাজ করবে!** 
- RAM & Storage based on Network ✅
- Variant এর RAM & Storage + Network ✅
- Color + Network + Storage combination ✅
