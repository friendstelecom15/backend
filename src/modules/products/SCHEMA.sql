-- ============================================================
-- E-Commerce Product Module - SQL Schema
-- Database: PostgreSQL (compatible with MySQL with minor changes)
-- ============================================================

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(600) NOT NULL UNIQUE,
    description TEXT,
    category_id UUID,
    brand_id UUID,
    product_code VARCHAR(100),
    sku VARCHAR(100),
    warranty VARCHAR(255),
    
    -- Status Flags
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT true,
    is_pos BOOLEAN DEFAULT true,
    is_pre_order BOOLEAN DEFAULT false,
    is_official BOOLEAN DEFAULT false,
    free_shipping BOOLEAN DEFAULT false,
    
    -- Rewards & Booking
    reward_points INTEGER DEFAULT 0,
    min_booking_price DECIMAL(10, 2) DEFAULT 0,
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT, -- Array stored as comma-separated
    seo_canonical VARCHAR(600),
    tags TEXT, -- Array stored as comma-separated
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_active_online ON products(is_active, is_online);

-- ============================================================
-- 2. PRODUCT_REGIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_regions_product_id ON product_regions(product_id);

-- ============================================================
-- 3. PRODUCT_COLORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL,
    color_name VARCHAR(100) NOT NULL,
    color_code VARCHAR(20) NOT NULL, -- Hex code
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (region_id) REFERENCES product_regions(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_colors_region_id ON product_colors(region_id);

-- ============================================================
-- 4. PRODUCT_STORAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_storages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    color_id UUID NOT NULL,
    storage_size VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_storages_color_id ON product_storages(color_id);

-- ============================================================
-- 5. PRODUCT_PRICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storage_id UUID NOT NULL UNIQUE,
    
    -- Pricing
    regular_price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),
    discount_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2),
    
    -- Campaign
    campaign_price DECIMAL(10, 2),
    campaign_start TIMESTAMP,
    campaign_end TIMESTAMP,
    
    -- Stock
    stock_quantity INTEGER DEFAULT 0,
    low_stock_alert INTEGER DEFAULT 5,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (storage_id) REFERENCES product_storages(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_prices_storage_id ON product_prices(storage_id);

-- ============================================================
-- 6. PRODUCT_IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    image_url VARCHAR(600) NOT NULL,
    is_thumbnail BOOLEAN DEFAULT false,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ============================================================
-- 7. PRODUCT_VIDEOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    video_url VARCHAR(600) NOT NULL,
    video_type VARCHAR(50), -- youtube, vimeo, cloudflare
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_videos_product_id ON product_videos(product_id);

-- ============================================================
-- 8. SPEC_GROUPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS spec_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name VARCHAR(100) NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spec_groups_group_name ON spec_groups(group_name);

-- ============================================================
-- 9. PRODUCT_SPECIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    spec_group_id UUID NOT NULL,
    spec_key VARCHAR(255) NOT NULL,
    spec_value TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (spec_group_id) REFERENCES spec_groups(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_specifications_product_spec ON product_specifications(product_id, spec_group_id);

-- ============================================================
-- 10. INSERT DEFAULT SPEC GROUPS
-- ============================================================
INSERT INTO spec_groups (group_name, display_order, icon) VALUES
('Display', 1, 'display-icon'),
('Platform', 2, 'cpu-icon'),
('Memory', 3, 'memory-icon'),
('Camera', 4, 'camera-icon'),
('Battery', 5, 'battery-icon'),
('Network', 6, 'network-icon'),
('Connectivity', 7, 'wifi-icon'),
('Body', 8, 'phone-icon'),
('Sound', 9, 'speaker-icon'),
('Sensors', 10, 'sensor-icon'),
('Features', 11, 'star-icon')
ON CONFLICT (group_name) DO NOTHING;

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- 1. Get product with all variants and pricing
SELECT 
    p.id, p.name, p.slug,
    r.region_name,
    c.color_name, c.color_code,
    s.storage_size,
    pr.regular_price, pr.discount_price, pr.campaign_price,
    pr.stock_quantity
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE p.slug = 'iphone-15-pro-max'
ORDER BY r.display_order, c.display_order, s.display_order;

-- 2. Get specific variant price
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
WHERE preg.product_id = 'product-uuid'
  AND preg.id = 'region-uuid'
  AND pc.id = 'color-uuid'
  AND ps.id = 'storage-uuid';

-- 3. Get total stock for a product
SELECT 
    p.id,
    p.name,
    SUM(pr.stock_quantity) as total_stock
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE p.slug = 'iphone-15-pro-max'
GROUP BY p.id, p.name;

-- 4. Get price range for a product
SELECT 
    p.id,
    p.name,
    MIN(
        CASE 
            WHEN pr.campaign_price IS NOT NULL 
                 AND pr.campaign_start <= NOW() 
                 AND pr.campaign_end >= NOW() 
            THEN pr.campaign_price
            WHEN pr.discount_price IS NOT NULL THEN pr.discount_price
            ELSE pr.regular_price
        END
    ) as min_price,
    MAX(
        CASE 
            WHEN pr.campaign_price IS NOT NULL 
                 AND pr.campaign_start <= NOW() 
                 AND pr.campaign_end >= NOW() 
            THEN pr.campaign_price
            WHEN pr.discount_price IS NOT NULL THEN pr.discount_price
            ELSE pr.regular_price
        END
    ) as max_price
FROM products p
JOIN product_regions r ON p.id = r.product_id
JOIN product_colors c ON r.id = c.region_id
JOIN product_storages s ON c.id = s.color_id
JOIN product_prices pr ON s.id = pr.storage_id
WHERE p.slug = 'iphone-15-pro-max'
GROUP BY p.id, p.name;

-- 5. Get products with low stock
SELECT 
    p.name,
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
ORDER BY pr.stock_quantity ASC;

-- 6. Get product specifications grouped
SELECT 
    p.name,
    sg.group_name,
    sg.icon,
    ps.spec_key,
    ps.spec_value
FROM products p
JOIN product_specifications ps ON p.id = ps.product_id
JOIN spec_groups sg ON ps.spec_group_id = sg.id
WHERE p.slug = 'iphone-15-pro-max'
ORDER BY sg.display_order, ps.display_order;

-- 7. Search products
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

-- 8. Get active campaigns
SELECT 
    p.name,
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
ORDER BY discount_percentage DESC;

-- ============================================================
-- MAINTENANCE QUERIES
-- ============================================================

-- Update stock quantity
UPDATE product_prices
SET stock_quantity = stock_quantity - 1,
    updated_at = NOW()
WHERE storage_id = 'storage-uuid'
  AND stock_quantity > 0;

-- Soft delete product
UPDATE products
SET deleted_at = NOW()
WHERE id = 'product-uuid';

-- Restore soft deleted product
UPDATE products
SET deleted_at = NULL
WHERE id = 'product-uuid';

-- Hard delete old soft-deleted products (cleanup)
DELETE FROM products
WHERE deleted_at < NOW() - INTERVAL '90 days';
