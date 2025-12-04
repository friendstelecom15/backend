# Network Variant Architecture - Visual Guide

## ✅ এখন যা যা সম্ভব:

### 1️⃣ **Network → Color → Storage (Recommended)**
```
iPad Air M3
├─ Network: WiFi
│  ├─ Color: Blue
│  │  ├─ Storage: 8/256GB → ৳109,990
│  │  └─ Storage: 8/512GB → ৳134,990
│  └─ Color: Purple
│     └─ Storage: 8/256GB → ৳109,990
└─ Network: WiFi+Cellular
   ├─ Color: Blue
   │  ├─ Storage: 8/256GB → ৳124,990 ✨ (+15K)
   │  └─ Storage: 8/512GB → ৳149,990 ✨ (+15K)
   └─ Color: Purple
      └─ Storage: 8/256GB → ৳124,990 ✨ (+15K)
```

### 2️⃣ **Color → Storage (with networkId)**
```
iPad Air M3
└─ Color: Starlight
   ├─ Storage: 8/256GB [WiFi] → ৳109,990
   ├─ Storage: 8/256GB [Cellular] → ৳124,990 ✨
   ├─ Storage: 8/512GB [WiFi] → ৳134,990
   └─ Storage: 8/512GB [Cellular] → ৳149,990 ✨
```

### 3️⃣ **Region + Network + Color + Storage** (Maximum Flexibility)
```
iPhone 15 Pro
├─ Region: International
│  ├─ Network: eSIM Only
│  │  └─ Color: Titanium
│  │     └─ Storage: 8/256GB → ৳149,990
│  └─ Network: Dual SIM
│     └─ Color: Titanium
│        └─ Storage: 8/256GB → ৳154,990
└─ Region: China
   └─ Network: Dual Physical SIM
      └─ Color: Titanium
         └─ Storage: 8/256GB → ৳139,990
```

---

## 📊 Entity Relationships

```
Product
│
├─── networks: ProductNetwork[]
│    │
│    ├─── colors: ProductColor[]
│    │    │
│    │    └─── storages: ProductStorage[]
│    │         │
│    │         └─── price: ProductPrice
│    │
│    └─── storages: ProductStorage[] (Direct network-storage, no color)
│         │
│         └─── price: ProductPrice
│
├─── regions: ProductRegion[]
│    │
│    └─── colors: ProductColor[]
│         │
│         └─── storages: ProductStorage[]
│              │
│              └─── price: ProductPrice
│
└─── directColors: ProductColor[]
     │
     └─── storages: ProductStorage[]
          │
          ├─── networkId?: ObjectId (Optional)
          │
          └─── price: ProductPrice
```

---

## 🎯 Real World Examples

### Example 1: iPad - Network affects ALL variants
```json
{
  "name": "iPad Air M3 13 inch",
  "networks": [
    {
      "networkType": "WiFi",
      "colors": [
        {
          "colorName": "Blue",
          "storages": [
            {"storageSize": "8/256GB", "price": {"regularPrice": 109990}}
          ]
        }
      ]
    },
    {
      "networkType": "WiFi+Cellular",
      "colors": [
        {
          "colorName": "Blue",
          "storages": [
            {"storageSize": "8/256GB", "price": {"regularPrice": 124990}}
          ]
        }
      ]
    }
  ]
}
```

### Example 2: iPad - Storage has networkId
```json
{
  "name": "iPad Air M3 13 inch",
  "networks": [
    {"networkType": "WiFi", "id": "net-wifi"},
    {"networkType": "WiFi+Cellular", "id": "net-cellular"}
  ],
  "directColors": [
    {
      "colorName": "Blue",
      "storages": [
        {
          "storageSize": "8/256GB",
          "networkId": "net-wifi",
          "price": {"regularPrice": 109990}
        },
        {
          "storageSize": "8/256GB",
          "networkId": "net-cellular",
          "price": {"regularPrice": 124990}
        }
      ]
    }
  ]
}
```

### Example 3: Apple Watch - Simple Network Pricing
```json
{
  "name": "Apple Watch Series 9",
  "networks": [
    {
      "networkType": "GPS",
      "colors": [
        {
          "colorName": "Midnight",
          "hasStorage": false,
          "singlePrice": 45990
        }
      ]
    },
    {
      "networkType": "GPS + Cellular",
      "priceAdjustment": 10000,
      "colors": [
        {
          "colorName": "Midnight",
          "hasStorage": false,
          "singlePrice": 55990
        }
      ]
    }
  ]
}
```

---

## 🔍 Query Examples

### Get all prices for a product across networks
```typescript
// Approach 1: Network → Color → Storage
const allPrices = product.networks
  .flatMap(network => 
    network.colors.flatMap(color => 
      color.storages.map(storage => ({
        network: network.networkType,
        color: color.colorName,
        storage: storage.storageSize,
        price: storage.price.regularPrice
      }))
    )
  );
```

### Get price for specific variant (Approach 2)
```typescript
// Storage with networkId
const storage = product.directColors
  .find(c => c.colorName === 'Blue')
  ?.storages.find(s => 
    s.storageSize === '8/256GB' && 
    s.networkId?.toString() === selectedNetworkId
  );

const price = storage?.price.regularPrice;
```

---

## 💡 Best Practices

### ✅ Use Network → Color → Storage when:
- Network affects ALL color/storage combinations
- You want to show network selection FIRST in UI
- Network is a major differentiator (iPad, Galaxy Tab)

### ✅ Use Storage.networkId when:
- Only storage pricing varies by network
- Colors are same across networks
- You want simpler data structure

### ✅ Combine with Regions when:
- Product has regional variants (China, Global, etc.)
- Different regions have different network types
- Example: iPhone China (Dual Physical SIM) vs Global (eSIM)

---

## 🚀 Summary

| Feature | Status | Entity |
|---------|--------|--------|
| Network variants | ✅ | `ProductNetwork` |
| Network → Colors | ✅ | `ProductColor.networkId` |
| Network → Storages | ✅ | `ProductStorage.networkId` |
| Network + Region | ✅ | Combined |
| Network + Color + Storage | ✅ | All levels |
| Different prices per network | ✅ | `ProductPrice` |

**হ্যাঁ ভাই, এখন সব কাজ করবে!** ✨

- ✅ Network based price variance
- ✅ RAM & Storage variant per network
- ✅ Color + Network + Storage combination
- ✅ Maximum flexibility
- ✅ Dazzle-like architecture support

কোনো সমস্যা থাকলে বলেন! 🎉
