import {MigrationInterface, QueryRunner} from "typeorm";

export class createRepeat1611089281801 implements MigrationInterface {
    name = 'createRepeat1611089281801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" RENAME COLUMN "repeat" TO "repeatId"`);
        await queryRunner.query(`CREATE TABLE "repeat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "freq" character varying NOT NULL, "start" TIMESTAMP NOT NULL, "end" TIMESTAMP DEFAULT null, "byweekday" text DEFAULT null, "exclude" text NOT NULL DEFAULT '[]', "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_915d72d86811bfc4872f43dacda" PRIMARY KEY ("id"))`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."done" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "done" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."start" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "start" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."end" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "end" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."color" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "color" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."deleted" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "deleted" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "repeatId"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "repeatId" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "UQ_d4cd7c36b7b57bf97cba108451b" UNIQUE ("repeatId")`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."deleted" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "deleted" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "list"."color" IS NULL`);
        await queryRunner.query(`ALTER TABLE "list" ALTER COLUMN "color" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "list"."deleted" IS NULL`);
        await queryRunner.query(`ALTER TABLE "list" ALTER COLUMN "deleted" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_d4cd7c36b7b57bf97cba108451b" FOREIGN KEY ("repeatId") REFERENCES "repeat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_d4cd7c36b7b57bf97cba108451b"`);
        await queryRunner.query(`ALTER TABLE "list" ALTER COLUMN "deleted" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "list"."deleted" IS NULL`);
        await queryRunner.query(`ALTER TABLE "list" ALTER COLUMN "color" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "list"."color" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "deleted" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."deleted" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "UQ_d4cd7c36b7b57bf97cba108451b"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "repeatId"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "repeatId" jsonb`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "deleted" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."deleted" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "color" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."color" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "end" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."end" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "start" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."start" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "done" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "task"."done" IS NULL`);
        await queryRunner.query(`DROP TABLE "repeat"`);
        await queryRunner.query(`ALTER TABLE "task" RENAME COLUMN "repeatId" TO "repeat"`);
    }

}
