import {MigrationInterface, QueryRunner} from "typeorm";

export class removeRepeatStart1618262640281 implements MigrationInterface {
    name = 'removeRepeatStart1618262640281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "repeat" DROP COLUMN "start"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "repeat" ADD "start" TIMESTAMP NOT NULL`);
    }

}
