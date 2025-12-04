import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductSlugIndex1733300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // MongoDB: Create unique index on slug field
    await queryRunner.query(`
      db.products.createIndex(
        { slug: 1 },
        { unique: true, name: "idx_products_slug_unique" }
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // MongoDB: Drop the unique index
    await queryRunner.query(`
      db.products.dropIndex("idx_products_slug_unique")
    `);
  }
}
