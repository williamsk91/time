import {MigrationInterface, QueryRunner} from "typeorm";

export class createTaskNote1621159028378 implements MigrationInterface {
    name = 'createTaskNote1621159028378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" jsonb NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task" ADD "noteId" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "UQ_b1bd0de0d1485b29cd2e844b2c1" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_b1bd0de0d1485b29cd2e844b2c1" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_b1bd0de0d1485b29cd2e844b2c1"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "UQ_b1bd0de0d1485b29cd2e844b2c1"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "noteId"`);
        await queryRunner.query(`DROP TABLE "note"`);
    }

}
