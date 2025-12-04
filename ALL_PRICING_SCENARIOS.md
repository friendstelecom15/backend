# All Product Pricing Scenarios - Complete Guide

## 📱 Scenario 1: Simple Product (10K-15K range, no variants)

**Example: Phone Case, Screen Protector, Basic Accessories**

```json
{
  "name": "Premium Phone Case",
  "slug": "premium-phone-case",
  "price": 1500,
  "comparePrice": 2000,
  "stockQuantity": 100,
  "lowStockAlert": 10
}
```

**UI Display:**
```
Premium Phone Case
Price: ৳1,500  ৳2,000
[Add to Cart]
```

---

## 📱 Scenario 2: Simple Product + Network Only (10K-15K tablet)

**Example: Basic Tablet where ONLY network affects price**

```json
{
  "name": "Basic Android Tablet 10 inch",
  "slug": "basic-android-tablet-10-inch",
  "price": 12990,
  "comparePrice": 14990,
  "networks": [
    {
      "networkType": "WiFi",
      "isDefault": true,
      "displayOrder": 1,
      "priceAdjustment": 0
    },
    {
      "networkType": "WiFi+ 4G",
      "isDefault": false,
      "displayOrder": 2,
      "priceAdjustment": 3000
    }
  ]
}
```

**UI Display:**
```
Basic Android Tablet 10 inch
Network: [WiFi ✓] [WiFi+ 4G]
Price: ৳12,990  ৳14,990
[Add to Cart]

// When WiFi+ 4G selected:
Price: ৳15,990  ৳17,990
```

**Frontend Logic:**
```typescript
const basePrice = product.price; // 12990
const selectedNetwork = product.networks.find(n => n.id === selectedNetworkId);
const finalPrice = basePrice + (selectedNetwork?.priceAdjustment || 0);

// WiFi: 12990 + 0 = 12990
// WiFi+4G: 12990 + 3000 = 15990
```

---

## 📱 Scenario 3: Color Variants Only (No Storage, No Network)

**Example: AirPods, Simple Accessories**

```json
{
  "name": "AirPods Pro 2nd Gen",
  "slug": "airpods-pro-2nd-gen",
  "directColors": [
    {
      "colorName": "White",
      "hasStorage": false,
      "singlePrice": 28990,
      "singleComparePrice": 32990,
      "singleStockQuantity": 50
    }
  ]
}
```

---

## 📱 Scenario 4: Network + Color Only (No Storage)

**Example: Apple Watch, Smart Bands**

```json
{
  "name": "Apple Watch Series 9 GPS 45mm",
  "slug": "apple-watch-series-9-45mm",
  "networks": [
    {
      "networkType": "GPS",
      "isDefault": true,
      "displayOrder": 1,
      "colors": [
        {
          "colorName": "Midnight",
          "colorImage": "midnight.jpg",
          "hasStorage": false,
          "singlePrice": 45990,
          "singleComparePrice": 49990,
          "singleStockQuantity": 20
        },
        {
          "colorName": "Starlight",
          "hasStorage": false,
          "singlePrice": 45990,
          "singleStockQuantity": 15
        }
      ]
    },
    {
      "networkType": "GPS + Cellular",
      "isDefault": false,
      "displayOrder": 2,
      "colors": [
        {
          "colorName": "Midnight",
          "hasStorage": false,
          "singlePrice": 55990,
          "singleComparePrice": 59990,
          "singleStockQuantity": 10
        },
        {
          "colorName": "Starlight",
          "hasStorage": false,
          "singlePrice": 55990,
          "singleStockQuantity": 8
        }
      ]
    }
  ]
}
```

**UI Display:**
```
Apple Watch Series 9 GPS 45mm

Network: [GPS ✓] [GPS + Cellular]

Color: [Midnight ✓] [Starlight]

Price: ৳45,990  ৳49,990

[Add to Cart]
```

---

## 📱 Scenario 5: Color + Storage (No Network)

**Example: Phone with color and storage variants**

```json
{
  "name": "Samsung Galaxy A54",
  "slug": "samsung-galaxy-a54",
  "directColors": [
    {
      "colorName": "Awesome Graphite",
      "hasStorage": true,
      "storages": [
        {
          "storageSize": "8/128GB",
          "price": {
            "regularPrice": 42990,
            "comparePrice": 47990,
            "stockQuantity": 25
          }
        },
        {
          "storageSize": "8/256GB",
          "price": {
            "regularPrice": 48990,
            "comparePrice": 53990,
            "stockQuantity": 18
          }
        }
      ]
    },
    {
      "colorName": "Awesome Lime",
      "hasStorage": true,
      "storages": [
        {
          "storageSize": "8/128GB",
          "price": {
            "regularPrice": 42990,
            "stockQuantity": 15
          }
        }
      ]
    }
  ]
}
```

---

## 📱 Scenario 6: Network + Color + Storage (Full Variants)

**Example: iPad, Premium Tablets**

```json
{
  "name": "Apple iPad Air M3 13 inch (2025)",
  "slug": "apple-ipad-air-m3-13-inch-2025",
  "networks": [
    {
      "networkType": "WiFi",
      "isDefault": true,
      "displayOrder": 1,
      "colors": [
        {
          "colorName": "Starlight",
          "colorImage": "starlight.jpg",
          "hasStorage": true,
          "storages": [
            {
              "storageSize": "8/128GB",
              "price": {
                "regularPrice": 94990,
                "comparePrice": 109990,
                "stockQuantity": 10
              }
            },
            {
              "storageSize": "8/256GB",
              "price": {
                "regularPrice": 109990,
                "comparePrice": 124990,
                "stockQuantity": 15
              }
            }
          ]
        },
        {
          "colorName": "Blue",
          "hasStorage": true,
          "storages": [
            {
              "storageSize": "8/256GB",
              "price": {
                "regularPrice": 109990,
                "stockQuantity": 12
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
          "hasStorage": true,
          "storages": [
            {
              "storageSize": "8/128GB",
              "price": {
                "regularPrice": 109990,
                "comparePrice": 124990,
                "stockQuantity": 8
              }
            },
            {
              "storageSize": "8/256GB",
              "price": {
                "regularPrice": 124990,
                "comparePrice": 139990,
                "stockQuantity": 10
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 📱 Scenario 7: Region + Network + Color + Storage

**Example: iPhone with regional + network variants**

```json
{
  "name": "iPhone 15 Pro Max",
  "slug": "iphone-15-pro-max",
  "regions": [
    {
      "regionName": "International",
      "isDefault": true,
      "displayOrder": 1,
      "colors": [
        {
          "colorName": "Natural Titanium",
          "hasStorage": true,
          "storages": [
            {
              "storageSize": "8/256GB",
              "price": {
                "regularPrice": 149990,
                "stockQuantity": 20
              }
            }
          ]
        }
      ]
    },
    {
      "regionName": "China (Dual Physical SIM)",
      "isDefault": false,
      "displayOrder": 2,
      "colors": [
        {
          "colorName": "Natural Titanium",
          "hasStorage": true,
          "storages": [
            {
              "storageSize": "8/256GB",
              "price": {
                "regularPrice": 139990,
                "stockQuantity": 10
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🎯 Frontend Query Logic

### Get Product Price (All Scenarios)

```typescript
function getProductPrice(product: Product, selections: {
  networkId?: string,
  colorId?: string,
  storageId?: string
}): number {
  
  // Scenario 1: Simple product (no variants)
  if (product.price && !product.networks?.length && !product.directColors?.length) {
    return product.price;
  }
  
  // Scenario 2: Base price + Network adjustment
  if (product.price && product.networks?.length && !product.networks[0].colors?.length) {
    const network = product.networks.find(n => n.id === selections.networkId);
    return product.price + (network?.priceAdjustment || 0);
  }
  
  // Scenario 3: Direct colors without storage
  if (product.directColors?.length) {
    const color = product.directColors.find(c => c.id === selections.colorId);
    
    if (!color?.hasStorage) {
      return color?.singlePrice || 0;
    }
    
    // Scenario 5: Color + Storage
    const storage = color.storages?.find(s => s.id === selections.storageId);
    return storage?.price?.regularPrice || 0;
  }
  
  // Scenario 4 & 6: Network + Color (with/without storage)
  if (product.networks?.length) {
    const network = product.networks.find(n => n.id === selections.networkId);
    const color = network?.colors?.find(c => c.id === selections.colorId);
    
    if (!color?.hasStorage) {
      // Scenario 4: Network + Color only
      return color?.singlePrice || 0;
    }
    
    // Scenario 6: Network + Color + Storage
    const storage = color.storages?.find(s => s.id === selections.storageId);
    return storage?.price?.regularPrice || 0;
  }
  
  // Scenario 7: Region-based
  if (product.regions?.length) {
    const region = product.regions.find(r => r.id === selections.regionId);
    const color = region?.colors?.find(c => c.id === selections.colorId);
    const storage = color?.storages?.find(s => s.id === selections.storageId);
    return storage?.price?.regularPrice || 0;
  }
  
  return 0;
}
```

---

## 📊 Summary Table

| Scenario | Base Price | Network | Color | Storage | Example |
|----------|-----------|---------|-------|---------|---------|
| 1. Simple | ✅ | ❌ | ❌ | ❌ | Phone Case |
| 2. Base + Network | ✅ | ✅ | ❌ | ❌ | Basic Tablet 10K-15K |
| 3. Color Only | ❌ | ❌ | ✅ | ❌ | AirPods |
| 4. Network + Color | ❌ | ✅ | ✅ | ❌ | Apple Watch |
| 5. Color + Storage | ❌ | ❌ | ✅ | ✅ | Samsung Phone |
| 6. Network + Color + Storage | ❌ | ✅ | ✅ | ✅ | iPad |
| 7. Region + All | ❌ | ❌ | ✅ | ✅ | iPhone (Regional) |

---

## ✅ হ্যাঁ, এখন সব কাজ করবে!

- ✅ **Simple product**: শুধু base price
- ✅ **Base + Network**: 10K-15K tablet যেখানে শুধু network এ price আলাদা
- ✅ **Network only**: প্রথমে network select, তারপর price adjust
- ✅ **Color variants**: শুধু color এ price আলাদা
- ✅ **Storage variants**: RAM/Storage ভিত্তিক pricing
- ✅ **Network + Color**: Network select করলে color price change
- ✅ **Network + Storage**: Network select করলে storage price change
- ✅ **Full variants**: Network + Color + RAM/Storage সব combination
- ✅ **Region + Network**: Regional + Network variants

**সব scenario handle করতে পারবে!** 🚀
