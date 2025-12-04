# Quick Reference: Which Fields to Use?

## 🎯 Decision Tree

```
START: আমার product কেমন?
│
├─ শুধু একটা price (no variants)
│  └─ Use: product.price, product.comparePrice, product.stockQuantity
│
├─ শুধু network based price (10K-15K tablet)
│  └─ Use: product.price + product.networks[].priceAdjustment
│
├─ শুধু color variants (no storage)
│  └─ Use: product.directColors[].singlePrice
│
├─ Color + Storage variants (phone)
│  └─ Use: product.directColors[].storages[].price
│
├─ Network + Color (no storage) - Apple Watch
│  └─ Use: product.networks[].colors[].singlePrice
│
├─ Network + Color + Storage (iPad)
│  └─ Use: product.networks[].colors[].storages[].price
│
└─ Region + Color + Storage (iPhone)
   └─ Use: product.regions[].colors[].storages[].price
```

---

## 📋 Field Usage Guide

### Scenario 1: Simple Product (৳1,500 Phone Case)
```typescript
{
  price: 1500,
  comparePrice: 2000,
  stockQuantity: 100,
  // Don't use: networks, regions, directColors
}
```

### Scenario 2: Base + Network (৳12,990 Tablet)
```typescript
{
  price: 12990,              // Base price for WiFi
  comparePrice: 14990,
  networks: [
    {
      networkType: "WiFi",
      priceAdjustment: 0     // Base price
    },
    {
      networkType: "WiFi+4G",
      priceAdjustment: 3000  // +3000 = 15,990
    }
  ]
  // Don't use: directColors, regions
  // colors[] inside networks should be EMPTY
}
```

### Scenario 3: Color Only (৳28,990 AirPods)
```typescript
{
  directColors: [
    {
      colorName: "White",
      hasStorage: false,
      singlePrice: 28990,
      singleComparePrice: 32990,
      singleStockQuantity: 50
      // Don't use: storages[]
    }
  ]
  // Don't use: price, networks, regions
}
```

### Scenario 4: Network + Color (৳45,990 Apple Watch)
```typescript
{
  networks: [
    {
      networkType: "GPS",
      colors: [
        {
          colorName: "Midnight",
          hasStorage: false,
          singlePrice: 45990,
          singleStockQuantity: 20
          // Don't use: storages[]
        }
      ]
    },
    {
      networkType: "GPS+Cellular",
      colors: [
        {
          colorName: "Midnight",
          hasStorage: false,
          singlePrice: 55990  // Different price for cellular
        }
      ]
    }
  ]
  // Don't use: price, directColors, regions
}
```

### Scenario 5: Color + Storage (৳42,990 Samsung Phone)
```typescript
{
  directColors: [
    {
      colorName: "Graphite",
      hasStorage: true,
      storages: [
        {
          storageSize: "8/128GB",
          price: {
            regularPrice: 42990,
            comparePrice: 47990,
            stockQuantity: 25
          }
        },
        {
          storageSize: "8/256GB",
          price: {
            regularPrice: 48990
          }
        }
      ]
      // Don't use: singlePrice, singleStockQuantity
    }
  ]
  // Don't use: price, networks, regions
}
```

### Scenario 6: Network + Color + Storage (৳109,990 iPad)
```typescript
{
  networks: [
    {
      networkType: "WiFi",
      colors: [
        {
          colorName: "Blue",
          hasStorage: true,
          storages: [
            {
              storageSize: "8/256GB",
              price: {
                regularPrice: 109990,
                stockQuantity: 15
              }
            }
          ]
          // Don't use: singlePrice
        }
      ]
    },
    {
      networkType: "WiFi+Cellular",
      colors: [
        {
          colorName: "Blue",
          hasStorage: true,
          storages: [
            {
              storageSize: "8/256GB",
              price: {
                regularPrice: 124990  // +15K for cellular
              }
            }
          ]
        }
      ]
    }
  ]
  // Don't use: price, directColors, regions
}
```

---

## 🔍 Common Mistakes to Avoid

### ❌ DON'T: Mix base price with variants
```typescript
{
  price: 12990,              // ❌ Wrong
  directColors: [            // ❌ Wrong
    { colorName: "Blue", singlePrice: 13990 }
  ]
}
```

### ✅ DO: Choose one approach
```typescript
// Option A: Simple
{ price: 12990 }

// Option B: With colors
{ directColors: [{ colorName: "Blue", singlePrice: 13990 }] }
```

### ❌ DON'T: Use singlePrice with storages
```typescript
{
  colorName: "Blue",
  hasStorage: true,
  singlePrice: 12990,        // ❌ Wrong (use storages instead)
  storages: [...]
}
```

### ✅ DO: Use correct price field based on hasStorage
```typescript
// If hasStorage = false
{
  hasStorage: false,
  singlePrice: 12990,        // ✅ Correct
  singleStockQuantity: 10
}

// If hasStorage = true
{
  hasStorage: true,
  storages: [                // ✅ Correct
    { storageSize: "8/128GB", price: {...} }
  ]
}
```

---

## 💡 Pro Tips

### 1. Network Affects Everything
```typescript
// If network changes ALL prices, use this structure:
networks: [
  {
    networkType: "WiFi",
    colors: [...]  // All variants nested here
  },
  {
    networkType: "Cellular",
    colors: [...]  // Different prices here
  }
]
```

### 2. Network Affects Only Base Price
```typescript
// If network only adjusts base price:
{
  price: 12990,
  networks: [
    { networkType: "WiFi", priceAdjustment: 0 },
    { networkType: "Cellular", priceAdjustment: 3000 }
  ]
}
```

### 3. Same Colors Across Networks
```typescript
// Approach A: Duplicate colors in each network
networks: [
  { networkType: "WiFi", colors: [{ colorName: "Blue", ... }] },
  { networkType: "Cellular", colors: [{ colorName: "Blue", ... }] }
]

// Approach B: Use storage.networkId
directColors: [
  {
    colorName: "Blue",
    storages: [
      { storageSize: "8/256GB", networkId: "wifi-id", price: {...} },
      { storageSize: "8/256GB", networkId: "cellular-id", price: {...} }
    ]
  }
]
```

---

## 🎯 Summary

| Use Case | Use These Fields | Don't Use |
|----------|-----------------|-----------|
| Simple product | `price`, `stockQuantity` | `networks`, `directColors` |
| Base + Network | `price`, `networks[].priceAdjustment` | `directColors`, colors in networks |
| Color only | `directColors[].singlePrice` | `price`, `networks` |
| Color + Storage | `directColors[].storages[].price` | `price`, `singlePrice` |
| Network + Color | `networks[].colors[].singlePrice` | `price`, `directColors` |
| Network + Color + Storage | `networks[].colors[].storages[].price` | `price`, `singlePrice` |
| Region variants | `regions[].colors[].storages[].price` | `price`, `networks` |

---

## ✅ এখন পরিষ্কার?

- ✅ Simple product → শুধু `price` field
- ✅ Network adjustment → `price` + `networks[].priceAdjustment`
- ✅ Color variants → `directColors[]`
- ✅ Storage variants → `storages[].price`
- ✅ Network variants → `networks[].colors[]`
- ✅ Full combo → Choose your structure!

**সব scenario handle করা যাবে!** 🚀
