import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsNewArchitecture1733184000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create products table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(500) NOT NULL,
        "slug" VARCHAR(600) NOT NULL UNIQUE,
        "description" TEXT,
        "category_id" UUID,
        "brand_id" UUID,
        "product_code" VARCHAR(100),
        "sku" VARCHAR(100),
        "warranty" VARCHAR(255),
        "is_active" BOOLEAN DEFAULT true,
        "is_online" BOOLEAN DEFAULT true,
        "is_pos" BOOLEAN DEFAULT true,
        "is_pre_order" BOOLEAN DEFAULT false,
        "is_official" BOOLEAN DEFAULT false,
        "free_shipping" BOOLEAN DEFAULT false,
        "reward_points" INTEGER DEFAULT 0,
        "min_booking_price" DECIMAL(10, 2) DEFAULT 0,
        "seo_title" VARCHAR(255),
        "seo_description" TEXT,
        "seo_keywords" TEXT,
        "seo_canonical" VARCHAR(600),
        "tags" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP
      );

      CREATE INDEX "idx_products_slug" ON "products" ("slug");
      CREATE INDEX "idx_products_category_id" ON "products" ("category_id");
      CREATE INDEX "idx_products_brand_id" ON "products" ("brand_id");
      CREATE INDEX "idx_products_active_online" ON "products" ("is_active", "is_online");
    `);

    // 2. Create product_regions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_regions" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product_id" UUID NOT NULL,
        "region_name" VARCHAR(100) NOT NULL,
        "is_default" BOOLEAN DEFAULT false,
        "display_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE
      );

      CREATE INDEX "idx_product_regions_product_id" ON "product_regions" ("product_id");
    `);

    // 3. Create product_colors table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_colors" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "region_id" UUID NOT NULL,
        "color_name" VARCHAR(100) NOT NULL,
        "color_code" VARCHAR(20) NOT NULL,
        "display_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("region_id") REFERENCES "product_regions" ("id") ON DELETE CASCADE
      );

      CREATE INDEX "idx_product_colors_region_id" ON "product_colors" ("region_id");
    `);

    // 4. Create product_storages table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_storages" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "color_id" UUID NOT NULL,
        "storage_size" VARCHAR(50) NOT NULL,
        "display_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("color_id") REFERENCES "product_colors" ("id") ON DELETE CASCADE
      );

      CREATE INDEX "idx_product_storages_color_id" ON "product_storages" ("color_id");
    `);

    // 5. Create product_prices table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_prices" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "storage_id" UUID NOT NULL UNIQUE,
        "regular_price" DECIMAL(10, 2) NOT NULL,
        "compare_price" DECIMAL(10, 2),
        "discount_price" DECIMAL(10, 2),
        "discount_percent" DECIMAL(5, 2),
        "campaign_price" DECIMAL(10, 2),
        "campaign_start" TIMESTAMP,
        "campaign_end" TIMESTAMP,
        "stock_quantity" INTEGER DEFAULT 0,
        "low_stock_alert" INTEGER DEFAULT 5,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("storage_id") REFERENCES "product_storages" ("id") ON DELETE CASCADE
      );

      CREATE INDEX "idx_product_prices_storage_id" ON "product_prices" ("storage_id");
    `);

    // 6. Create product_images table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_images" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product_id" UUID NOT NULL,
        "image_url" VARCHAR(600) NOT NULL,
        "is_thumbnail" BOOLEAN DEFAULT false,
        "alt_text" VARCHAR(255),
        "display_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE
      );

      CREATE INDEX "idx_product_images_product_id" ON "product_images" ("product_id");
    `);

    // 7. Create product_videos table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_videos" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product_id" UUID NOT NULL,
        "video_url" VARCHAR(600) NOT NULL,
        "video_type" VARCHAR(50),
        "display_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE
      );

      CREATE INDEX "idx_product_videos_product_id" ON "product_videos" ("product_id");
    `);

    // 8. Create spec_groups table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "spec_groups" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "group_name" VARCHAR(100) NOT NULL UNIQUE,
        "display_order" INTEGER DEFAULT 0,
        "icon" VARCHAR(100),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX "idx_spec_groups_group_name" ON "spec_groups" ("group_name");
    `);

    // 9. Create product_specifications table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_specifications" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product_id" UUID NOT NULL,
        "spec_group_id" UUID NOT NULL,
        "spec_key" VARCHAR(255) NOT NULL,
        "spec_value" TEXT NOT NULL,
        "display_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("spec_group_id") REFERENCES "spec_groups" ("id") ON DELETE CASCADE
      );

      CREATE INDEX "idx_product_specifications_product_spec" ON "product_specifications" ("product_id", "spec_group_id");
    `);

    // 10. Insert default spec groups
    await queryRunner.query(`
      INSERT INTO "spec_groups" ("group_name", "display_order", "icon") VALUES
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
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "product_specifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "spec_groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_videos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_prices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_storages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_colors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_regions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}
