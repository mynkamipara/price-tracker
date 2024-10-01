import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertCoins1689434500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO tracker_info.coins (id, name, symbol, slug, created_at, updated_at)
            VALUES 
                (gen_random_uuid(), 'Ethereum', 'ETH', 'ethereum', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                (gen_random_uuid(), 'Polygon', 'MATIC', 'polygon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM tracker_info.coins 
            WHERE slug IN ('ethereum', 'polygon');
        `);
    }
}
