# 🔍 Common SQL Queries for Product Module

## Product Queries

### 1. Get Product with All Details
```sql
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.category_id,
    p.brand_id,
    p.is_active,
    p.free_shipping,
    p.reward_points
FROM products p
WHERE p.slug = 'iphone-15-pro-max'
  AND p.deleted_at IS NULL;
```

### 2. Get Active Products with Stock
```sql
SELECT 
    p.id,
    p.name,
    SUM(pr.stock_quantity) as total_stock,
    MIN(pr.regular_price) as min_price,
    MAX(pr.regular_price) as max_price
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE p.is_active = true
  AND p.is_online = true
  AND p.deleted_at IS NULL
GROUP BY p.id, p.name
HAVING SUM(pr.stock_quantity) > 0
ORDER BY p.created_at DESC;
```

### 3. Search Products
```sql
SELECT DISTINCT p.*
FROM products p
WHERE (
    p.name ILIKE '%iphone%' 
    OR p.description ILIKE '%iphone%'
    OR p.product_code ILIKE '%iphone%'
)
AND p.deleted_at IS NULL
AND p.is_active = true
ORDER BY p.created_at DESC
LIMIT 20;
```

### 4. Get Products by Category
```sql
SELECT p.*
FROM products p
WHERE p.category_id = 'category-uuid'
  AND p.deleted_at IS NULL
  AND p.is_active = true
ORDER BY p.created_at DESC
LIMIT 50 OFFSET 0;
```

## Variant & Pricing Queries

### 5. Get All Variants for a Product
```sql
SELECT 
    p.name as product_name,
    r.region_name,
    c.color_name,
    c.color_code,
    s.storage_size,
    pr.regular_price,
    pr.discount_price,
    pr.campaign_price,
    pr.stock_quantity,
    CASE 
        WHEN pr.campaign_price IS NOT NULL 
             AND pr.campaign_start <= NOW() 
             AND pr.campaign_end >= NOW() 
        THEN pr.campaign_price
        WHEN pr.discount_price IS NOT NULL 
        THEN pr.discount_price
        ELSE pr.regular_price
    END as final_price
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE p.slug = 'iphone-15-pro-max'
ORDER BY r.display_order, c.display_order, s.display_order;
```

### 6. Get Specific Variant Price
```sql
SELECT 
    r.region_name,
    c.color_name,
    c.color_code,
    s.storage_size,
    pr.regular_price,
    pr.compare_price,
    pr.discount_price,
    pr.discount_percent,
    pr.campaign_price,
    pr.campaign_start,
    pr.campaign_end,
    pr.stock_quantity,
    pr.low_stock_alert,
    CASE 
        WHEN pr.campaign_price IS NOT NULL 
             AND pr.campaign_start <= NOW() 
             AND pr.campaign_end >= NOW() 
        THEN pr.campaign_price
        WHEN pr.discount_price IS NOT NULL 
        THEN pr.discount_price
        ELSE pr.regular_price
    END as final_price,
    CASE 
        WHEN pr.campaign_price IS NOT NULL 
             AND pr.campaign_start <= NOW() 
             AND pr.campaign_end >= NOW() 
        THEN true
        ELSE false
    END as campaign_active
FROM product_prices pr
JOIN product_storages s ON pr.storage_id = s.id
JOIN product_colors c ON s.color_id = c.id
JOIN product_regions r ON c.region_id = r.id
WHERE r.product_id = 'product-uuid'
  AND r.id = 'region-uuid'
  AND c.id = 'color-uuid'
  AND s.id = 'storage-uuid';
```

### 7. Get Price Range for Product
```sql
SELECT 
    p.id,
    p.name,
    MIN(
        CASE 
            WHEN pr.campaign_price IS NOT NULL 
                 AND pr.campaign_start <= NOW() 
                 AND pr.campaign_end >= NOW() 
            THEN pr.campaign_price
            WHEN pr.discount_price IS NOT NULL 
            THEN pr.discount_price
            ELSE pr.regular_price
        END
    ) as min_price,
    MAX(
        CASE 
            WHEN pr.campaign_price IS NOT NULL 
                 AND pr.campaign_start <= NOW() 
                 AND pr.campaign_end >= NOW() 
            THEN pr.campaign_price
            WHEN pr.discount_price IS NOT NULL 
            THEN pr.discount_price
            ELSE pr.regular_price
        END
    ) as max_price,
    COUNT(DISTINCT pr.id) as variant_count
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE p.slug = 'iphone-15-pro-max'
GROUP BY p.id, p.name;
```

## Stock Management Queries

### 8. Get Low Stock Products
```sql
SELECT 
    p.name as product_name,
    r.region_name,
    c.color_name,
    s.storage_size,
    pr.stock_quantity,
    pr.low_stock_alert
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE pr.stock_quantity <= pr.low_stock_alert
  AND pr.stock_quantity > 0
  AND p.deleted_at IS NULL
  AND p.is_active = true
ORDER BY pr.stock_quantity ASC;
```

### 9. Get Out of Stock Products
```sql
SELECT 
    p.id,
    p.name,
    COUNT(DISTINCT pr.id) as out_of_stock_variants
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE pr.stock_quantity = 0
  AND p.deleted_at IS NULL
GROUP BY p.id, p.name
HAVING COUNT(DISTINCT pr.id) > 0
ORDER BY out_of_stock_variants DESC;
```

### 10. Update Stock After Order
```sql
UPDATE product_prices
SET stock_quantity = stock_quantity - 1,
    updated_at = NOW()
WHERE storage_id = 'storage-uuid'
  AND stock_quantity > 0
RETURNING stock_quantity;
```

### 11. Get Total Stock by Product
```sql
SELECT 
    p.id,
    p.name,
    SUM(pr.stock_quantity) as total_stock,
    COUNT(DISTINCT pr.id) as total_variants,
    SUM(CASE WHEN pr.stock_quantity > 0 THEN 1 ELSE 0 END) as in_stock_variants
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name
ORDER BY total_stock DESC;
```

## Campaign & Discount Queries

### 12. Get Active Campaign Products
```sql
SELECT 
    p.name as product_name,
    r.region_name,
    c.color_name,
    s.storage_size,
    pr.regular_price,
    pr.campaign_price,
    pr.campaign_start,
    pr.campaign_end,
    ROUND(((pr.regular_price - pr.campaign_price) / pr.regular_price * 100), 2) as discount_percentage
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE pr.campaign_price IS NOT NULL
  AND pr.campaign_start <= NOW()
  AND pr.campaign_end >= NOW()
  AND p.deleted_at IS NULL
  AND p.is_active = true
ORDER BY discount_percentage DESC;
```

### 13. Get Expired Campaigns
```sql
SELECT 
    p.name,
    COUNT(*) as expired_variants
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE pr.campaign_price IS NOT NULL
  AND pr.campaign_end < NOW()
  AND p.deleted_at IS NULL
GROUP BY p.id, p.name;
```

### 14. Get Best Discounts
```sql
SELECT 
    p.name,
    r.region_name,
    c.color_name,
    s.storage_size,
    pr.regular_price,
    pr.discount_price,
    pr.discount_percent,
    (pr.regular_price - pr.discount_price) as savings
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE pr.discount_price IS NOT NULL
  AND p.deleted_at IS NULL
  AND p.is_active = true
ORDER BY discount_percent DESC
LIMIT 20;
```

## Specification Queries

### 15. Get Product Specifications
```sql
SELECT 
    p.name as product_name,
    sg.group_name,
    sg.icon,
    sg.display_order as group_order,
    ps.spec_key,
    ps.spec_value,
    ps.display_order as spec_order
FROM products p
JOIN product_specifications ps ON p.id = ps.product_id
JOIN spec_groups sg ON ps.spec_group_id = sg.id
WHERE p.slug = 'iphone-15-pro-max'
ORDER BY sg.display_order, ps.display_order;
```

### 16. Search by Specification
```sql
SELECT DISTINCT p.*
FROM products p
JOIN product_specifications ps ON p.id = ps.product_id
WHERE (ps.spec_key ILIKE '%camera%' OR ps.spec_value ILIKE '%48 MP%')
  AND p.deleted_at IS NULL
  AND p.is_active = true;
```

### 17. Get Products by Spec Group
```sql
SELECT 
    p.id,
    p.name,
    string_agg(ps.spec_key || ': ' || ps.spec_value, ', ') as specifications
FROM products p
JOIN product_specifications ps ON p.id = ps.product_id
JOIN spec_groups sg ON ps.spec_group_id = sg.id
WHERE sg.group_name = 'Camera'
  AND p.deleted_at IS NULL
GROUP BY p.id, p.name;
```

## Image & Video Queries

### 18. Get Product Images
```sql
SELECT 
    pi.id,
    pi.image_url,
    pi.is_thumbnail,
    pi.alt_text,
    pi.display_order
FROM product_images pi
JOIN products p ON pi.product_id = p.id
WHERE p.slug = 'iphone-15-pro-max'
ORDER BY pi.display_order;
```

### 19. Get Thumbnail for Multiple Products
```sql
SELECT 
    p.id,
    p.name,
    pi.image_url as thumbnail
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_thumbnail = true
WHERE p.deleted_at IS NULL
  AND p.is_active = true
ORDER BY p.created_at DESC
LIMIT 20;
```

## Analytics Queries

### 20. Product Statistics
```sql
SELECT 
    p.id,
    p.name,
    COUNT(DISTINCT r.id) as total_regions,
    COUNT(DISTINCT c.id) as total_colors,
    COUNT(DISTINCT s.id) as total_storages,
    COUNT(DISTINCT pr.id) as total_variants,
    SUM(pr.stock_quantity) as total_stock,
    MIN(pr.regular_price) as min_price,
    MAX(pr.regular_price) as max_price,
    AVG(pr.regular_price) as avg_price,
    COUNT(DISTINCT pi.id) as total_images,
    COUNT(DISTINCT pv.id) as total_videos,
    COUNT(DISTINCT ps.id) as total_specs
FROM products p
LEFT JOIN product_regions r ON p.id = r.product_id
LEFT JOIN product_colors c ON r.id = c.region_id
LEFT JOIN product_storages s ON c.id = s.color_id
LEFT JOIN product_prices pr ON s.id = pr.storage_id
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_videos pv ON p.id = pv.product_id
LEFT JOIN product_specifications ps ON p.id = ps.product_id
WHERE p.slug = 'iphone-15-pro-max'
GROUP BY p.id, p.name;
```

### 21. Top Selling Variants (with order data)
```sql
-- Assuming you have an orders table
SELECT 
    p.name,
    r.region_name,
    c.color_name,
    s.storage_size,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.price * oi.quantity) as total_revenue
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN order_items oi ON s.id = oi.storage_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name, r.region_name, c.color_name, s.storage_size
ORDER BY total_quantity_sold DESC
LIMIT 10;
```

### 22. Inventory Value
```sql
SELECT 
    p.category_id,
    COUNT(DISTINCT p.id) as total_products,
    SUM(pr.stock_quantity) as total_units,
    SUM(pr.stock_quantity * pr.regular_price) as inventory_value
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE p.deleted_at IS NULL
  AND p.is_active = true
GROUP BY p.category_id
ORDER BY inventory_value DESC;
```

## Maintenance Queries

### 23. Clean Up Expired Campaigns
```sql
UPDATE product_prices
SET campaign_price = NULL,
    campaign_start = NULL,
    campaign_end = NULL,
    updated_at = NOW()
WHERE campaign_end < NOW() - INTERVAL '7 days';
```

### 24. Soft Delete Product
```sql
UPDATE products
SET deleted_at = NOW()
WHERE id = 'product-uuid';
```

### 25. Restore Soft Deleted Product
```sql
UPDATE products
SET deleted_at = NULL
WHERE id = 'product-uuid';
```

### 26. Hard Delete Old Soft-Deleted Products
```sql
-- Delete products soft-deleted more than 90 days ago
DELETE FROM products
WHERE deleted_at < NOW() - INTERVAL '90 days';
```

### 27. Update Product Prices in Bulk
```sql
UPDATE product_prices pr
SET regular_price = regular_price * 1.10,  -- 10% increase
    updated_at = NOW()
FROM product_storages s
JOIN product_colors c ON s.color_id = c.id
JOIN product_regions r ON c.region_id = r.id
WHERE pr.storage_id = s.id
  AND r.product_id = 'product-uuid';
```

## Performance Optimization Queries

### 28. Find Products Missing Thumbnails
```sql
SELECT p.id, p.name
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_thumbnail = true
WHERE pi.id IS NULL
  AND p.deleted_at IS NULL;
```

### 29. Find Products Without Specifications
```sql
SELECT p.id, p.name
FROM products p
LEFT JOIN product_specifications ps ON p.id = ps.product_id
WHERE ps.id IS NULL
  AND p.deleted_at IS NULL;
```

### 30. Database Size Analysis
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN (
    'products', 'product_regions', 'product_colors', 
    'product_storages', 'product_prices', 'product_images',
    'product_videos', 'spec_groups', 'product_specifications'
)
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Tips for Query Optimization

1. **Always use indexes**: All foreign keys have indexes
2. **Use LIMIT**: For pagination and large result sets
3. **Filter early**: Add WHERE clauses before JOINs when possible
4. **Use EXPLAIN ANALYZE**: To understand query performance
5. **Cache results**: Cache frequently accessed data
6. **Avoid SELECT ***: Select only needed columns
7. **Use prepared statements**: For security and performance

---

**More queries needed? Check the TypeORM service implementation for additional examples.**
