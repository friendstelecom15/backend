# 🎨 Visual Architecture Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATIONS                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Web    │  │  Mobile  │  │   POS    │  │  Admin   │       │
│  │ Frontend │  │   App    │  │  System  │  │  Panel   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REST API LAYER                              │
│                                                                  │
│  POST   /products-new         ← Create Product                  │
│  GET    /products-new         ← List Products                   │
│  GET    /products-new/search  ← Search Products                 │
│  GET    /products-new/:slug   ← Get Product Details             │
│  GET    /products-new/:id/variant-price ← Get Variant Price     │
│  PATCH  /products-new/:id     ← Update Product                  │
│  DELETE /products-new/:id     ← Delete Product                  │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         ProductsNewService                              │    │
│  │  • create()         - Transaction-based insert          │    │
│  │  • findAll()        - List with filters & pagination    │    │
│  │  • findOne()        - Get by slug with relations        │    │
│  │  • getVariantPrice()- Query specific variant            │    │
│  │  • update()         - Update product                    │    │
│  │  • remove()         - Soft delete                       │    │
│  │  • search()         - Full-text search                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PRODUCTS                                                 │  │
│  │  id, name, slug, description, category_id, brand_id...   │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│          ┌───────────────┼───────────────┐                     │
│          ▼               ▼               ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   REGIONS   │  │   IMAGES    │  │    VIDEOS   │           │
│  └──────┬──────┘  └─────────────┘  └─────────────┘           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                     ┌─────────────┐           │
│  │   COLORS    │                     │ SPEC_GROUPS │           │
│  └──────┬──────┘                     └──────┬──────┘           │
│         │                                   │                  │
│         ▼                                   ▼                  │
│  ┌─────────────┐                     ┌─────────────┐           │
│  │  STORAGES   │                     │    SPECS    │           │
│  └──────┬──────┘                     └─────────────┘           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   PRICES    │                                               │
│  └─────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Product Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  CREATE PRODUCT REQUEST                         │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    DTO VALIDATION                               │
│  • Validate all required fields                                │
│  • Transform nested objects                                    │
│  • Check data types                                            │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                  START TRANSACTION                              │
│  BEGIN TRANSACTION;                                            │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│         STEP 1: INSERT PRODUCT                                  │
│  INSERT INTO products (name, slug, description...)             │
│  VALUES (...);                                                 │
│  → product_id                                                  │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│         STEP 2: INSERT REGIONS                                  │
│  FOR EACH region IN regions:                                   │
│    INSERT INTO product_regions (product_id, region_name...)    │
│    → region_id                                                 │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│         STEP 3: INSERT COLORS                                   │
│  FOR EACH color IN region.colors:                              │
│    INSERT INTO product_colors (region_id, color_name...)       │
│    → color_id                                                  │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│         STEP 4: INSERT STORAGES                                 │
│  FOR EACH storage IN color.storages:                           │
│    INSERT INTO product_storages (color_id, storage_size...)    │
│    → storage_id                                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│         STEP 5: INSERT PRICES                                   │
│  FOR EACH price IN storage.price:                              │
│    INSERT INTO product_prices (storage_id, regular_price...)   │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│         STEP 6: INSERT IMAGES                                   │
│  FOR EACH image IN images:                                     │
│    INSERT INTO product_images (product_id, image_url...)       │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│         STEP 7: INSERT VIDEOS                                   │
│  FOR EACH video IN videos:                                     │
│    INSERT INTO product_videos (product_id, video_url...)       │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│         STEP 8: INSERT SPECIFICATIONS                           │
│  FOR EACH spec_group IN specifications:                        │
│    - Find or create spec_group                                │
│    - Insert each spec in the group                             │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                  COMMIT TRANSACTION                             │
│  COMMIT;                                                       │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│               RETURN COMPLETE PRODUCT                           │
│  • Fetch with all relations                                    │
│  • Format response                                             │
│  • Calculate price range                                       │
│  • Calculate total stock                                       │
└────────────────────────────────────────────────────────────────┘

       IF ERROR AT ANY STEP → ROLLBACK TRANSACTION
```

## Price Calculation Flow

```
┌────────────────────────────────────────────────────────────────┐
│              USER SELECTS PRODUCT VARIANT                       │
│  Region: International                                         │
│  Color: Natural Titanium                                       │
│  Storage: 256GB                                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                FETCH VARIANT PRICE                              │
│  SELECT * FROM product_prices pr                               │
│  JOIN product_storages s ON pr.storage_id = s.id              │
│  WHERE s.id = 'storage-uuid'                                   │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│              PRICE DECISION TREE                                │
│                                                                 │
│  1. Check Campaign Price                                       │
│     ├─ Is campaign_price set? ─────────┐                      │
│     │                                   │                      │
│     YES                                NO                      │
│     │                                   │                      │
│     ├─ Is campaign active? ────────┐   │                      │
│     │  (NOW between start & end)   │   │                      │
│     │                               │   │                      │
│     YES                            NO  │                      │
│     │                               │   │                      │
│     └─► USE CAMPAIGN_PRICE          │   │                      │
│                                     │   │                      │
│  2. Check Discount Price ◄──────────┴───┘                      │
│     ├─ Is discount_price set? ──────┐                         │
│     │                                │                         │
│     YES                             NO                         │
│     │                                │                         │
│     └─► USE DISCOUNT_PRICE           │                         │
│                                      │                         │
│  3. Regular Price ◄──────────────────┘                         │
│     └─► USE REGULAR_PRICE                                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                 RETURN FINAL PRICE                              │
│  {                                                             │
│    regular: 1299.99,                                           │
│    compare: 1399.99,                                           │
│    discount: 1249.99,                                          │
│    campaign: 1199.99,                                          │
│    campaignActive: true,                                       │
│    final: 1199.99  ← SELECTED PRICE                           │
│  }                                                             │
└────────────────────────────────────────────────────────────────┘
```

## Stock Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  CUSTOMER PLACES ORDER                          │
│  Product: iPhone 15 Pro Max                                    │
│  Variant: International / Natural Titanium / 256GB             │
│  Quantity: 1                                                   │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│              CHECK STOCK AVAILABILITY                           │
│  SELECT stock_quantity                                         │
│  FROM product_prices                                           │
│  WHERE storage_id = 'storage-uuid'                             │
│  → Current Stock: 50                                           │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
              Stock > 0?           Stock = 0
                    │                   │
                   YES                  │
                    │                   ▼
                    │         ┌──────────────────┐
                    │         │  OUT OF STOCK    │
                    │         │  Reject Order    │
                    │         └──────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────────┐
│                  DEDUCT STOCK                                   │
│  UPDATE product_prices                                         │
│  SET stock_quantity = stock_quantity - 1,                      │
│      updated_at = NOW()                                        │
│  WHERE storage_id = 'storage-uuid'                             │
│    AND stock_quantity > 0                                      │
│  → New Stock: 49                                               │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│              CHECK LOW STOCK ALERT                              │
│  IF stock_quantity <= low_stock_alert:                         │
│    → Trigger notification                                      │
│    → Send alert to admin                                       │
│    → Add to reorder list                                       │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                  CONFIRM ORDER                                  │
│  Order Status: Confirmed                                       │
│  Stock Reserved: Yes                                           │
└────────────────────────────────────────────────────────────────┘
```

## Search & Filter Flow

```
┌────────────────────────────────────────────────────────────────┐
│                USER SEARCHES/FILTERS                            │
│  Query: "iphone"                                               │
│  Category: Mobile Phones                                       │
│  Brand: Apple                                                  │
│  Min Price: 1000                                               │
│  Max Price: 1500                                               │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                BUILD SQL QUERY                                  │
│  SELECT DISTINCT p.*                                           │
│  FROM products p                                               │
│  LEFT JOIN product_regions r ON p.id = r.product_id           │
│  LEFT JOIN product_colors c ON r.id = c.region_id             │
│  LEFT JOIN product_storages s ON c.id = s.color_id            │
│  LEFT JOIN product_prices pr ON s.id = pr.storage_id          │
│  WHERE 1=1                                                     │
│    AND p.deleted_at IS NULL                                    │
│    AND p.is_active = true                                      │
│    AND (p.name ILIKE '%iphone%'                                │
│         OR p.description ILIKE '%iphone%')                     │
│    AND p.category_id = 'mobile-phones-uuid'                    │
│    AND p.brand_id = 'apple-uuid'                               │
│    AND pr.regular_price BETWEEN 1000 AND 1500                  │
│  GROUP BY p.id                                                 │
│  ORDER BY p.created_at DESC                                    │
│  LIMIT 20 OFFSET 0                                             │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│              EXECUTE QUERY WITH INDEXES                         │
│  → Use idx_products_category_id                                │
│  → Use idx_products_brand_id                                   │
│  → Use idx_products_active_online                              │
│  → Scan price range efficiently                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                FETCH RELATED DATA                               │
│  • Load product images (thumbnail)                             │
│  • Calculate price range per product                           │
│  • Calculate total stock per product                           │
│  • Join category and brand names                               │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                FORMAT RESPONSE                                  │
│  [                                                             │
│    {                                                           │
│      id: "uuid",                                               │
│      name: "iPhone 15 Pro Max",                                │
│      slug: "iphone-15-pro-max",                                │
│      priceRange: { min: 1199, max: 1699 },                     │
│      totalStock: 305,                                          │
│      thumbnail: "https://...",                                 │
│      category: { id: "...", name: "Mobile Phones" },           │
│      brand: { id: "...", name: "Apple" }                       │
│    },                                                          │
│    ...                                                         │
│  ]                                                             │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│              RETURN TO CLIENT                                   │
│  Status: 200 OK                                                │
│  Results: 15 products                                          │
│  Execution Time: 45ms                                          │
└────────────────────────────────────────────────────────────────┘
```

## Frontend Integration Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    PRODUCT LIST PAGE                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  [Category Filter] [Brand Filter] [Price Range]       │    │
│  │  [Search: "iphone"                              ] 🔍  │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  [Image]    │  │  [Image]    │  │  [Image]    │           │
│  │  iPhone 15  │  │  Samsung S24│  │  Xiaomi 14  │           │
│  │  $1,199-    │  │  $999-      │  │  $799-      │           │
│  │  $1,699     │  │  $1,299     │  │  $999       │           │
│  │  In Stock   │  │  In Stock   │  │  Low Stock  │           │
│  │  [View]     │  │  [View]     │  │  [View]     │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  API Call: GET /products-new?search=iphone&limit=20           │
└────────────────────────────────────────────────────────────────┘
                              │
                        User clicks "View"
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                  PRODUCT DETAILS PAGE                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         [Image Gallery]        │  iPhone 15 Pro Max  │    │
│  │  ┌─────┬─────┬─────┬─────┐    │  $1,199             │    │
│  │  │ [1] │ [2] │ [3] │ [4] │    │                      │    │
│  │  └─────┴─────┴─────┴─────┘    │  Select Region:      │    │
│  │         [Main Image]           │  ○ International ✓   │    │
│  │                                │  ○ UAE               │    │
│  │                                │                      │    │
│  │                                │  Select Color:       │    │
│  │                                │  ● Natural Titanium ✓│    │
│  │                                │  ○ Blue Titanium     │    │
│  │                                │  ○ White Titanium    │    │
│  │                                │                      │    │
│  │                                │  Select Storage:     │    │
│  │                                │  ● 256GB - $1,199 ✓  │    │
│  │                                │  ○ 512GB - $1,499    │    │
│  │                                │  ○ 1TB   - $1,699    │    │
│  │                                │                      │    │
│  │                                │  Stock: 50 units     │    │
│  │                                │  [Add to Cart]       │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Specifications Tab] [Reviews Tab] [Description Tab]          │
│                                                                 │
│  Display:                          Camera:                     │
│  • Screen Size: 6.7 inches         • Main: 48 MP               │
│  • Resolution: 2796x1290           • Telephoto: 12 MP          │
│  • Technology: OLED                • Front: 12 MP              │
│                                                                 │
│  API Calls:                                                    │
│  1. GET /products-new/iphone-15-pro-max                        │
│  2. GET /products-new/:id/variant-price?regionId=...           │
└────────────────────────────────────────────────────────────────┘
```

---

**These diagrams provide a visual understanding of the system architecture and data flows.**
