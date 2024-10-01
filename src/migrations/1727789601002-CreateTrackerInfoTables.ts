import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTrackerInfoTables1689434400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SCHEMA IF NOT EXISTS tracker_info;
        `);

        await queryRunner.query(`
            CREATE TABLE tracker_info.coins (
                id uuid NOT NULL DEFAULT gen_random_uuid(),
                name varchar NOT NULL,
                symbol varchar NOT NULL,
                slug varchar NOT NULL,
                created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT pk_coins_id PRIMARY KEY (id)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE tracker_info.prices (
                id uuid NOT NULL DEFAULT gen_random_uuid(),
                price numeric(10, 2) NOT NULL,
                "timestamp" timestamp NOT NULL,
                percent_change_1h numeric(10, 2) NOT NULL,
                percent_change_24h numeric(10, 2) NOT NULL,
                coin_id UUID NOT NULL,
                created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_prices_coin_id
                    FOREIGN KEY (coin_id) REFERENCES tracker_info.coins (id),
                CONSTRAINT pk_prices_id PRIMARY KEY (id)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE tracker_info.alert (
                id uuid NOT NULL DEFAULT gen_random_uuid(),
                price DECIMAL NOT NULL,
                email VARCHAR(255) NOT NULL,
                is_achive BOOLEAN DEFAULT FALSE,
                coin_id UUID NOT NULL,
                created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_alert_coin_id
                    FOREIGN KEY (coin_id) REFERENCES tracker_info.coins (id),
                CONSTRAINT pk_alert_id PRIMARY KEY (id)
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS tracker_info.alert;
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS tracker_info.prices;
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS tracker_info.coins;
        `);
        await queryRunner.query(`
            DROP SCHEMA IF EXISTS tracker_info;
        `);
    }
}
