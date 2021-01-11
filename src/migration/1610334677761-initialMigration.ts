import {MigrationInterface, QueryRunner} from "typeorm";

export class initialMigration1610334677761 implements MigrationInterface {
    name = 'initialMigration1610334677761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "done" TIMESTAMP DEFAULT null, "start" TIMESTAMP DEFAULT null, "end" TIMESTAMP DEFAULT null, "includeTime" boolean NOT NULL DEFAULT false, "color" character varying DEFAULT null, "order" SERIAL NOT NULL, "repeat" jsonb DEFAULT null, "deleted" TIMESTAMP DEFAULT null, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "listId" uuid, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "googleId" character varying, "count" integer NOT NULL DEFAULT '0', "deleted" TIMESTAMP DEFAULT null, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_470355432cc67b2c470c30bef7c" UNIQUE ("googleId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "color" character varying DEFAULT null, "order" SERIAL NOT NULL, "deleted" TIMESTAMP DEFAULT null, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_d8feafd203525d5f9c37b3ed3b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_d2275fe92da6a114d70796b7344" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "list" ADD CONSTRAINT "FK_46ded14b26382088c9f032f8953" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "list" DROP CONSTRAINT "FK_46ded14b26382088c9f032f8953"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_d2275fe92da6a114d70796b7344"`);
        await queryRunner.query(`DROP TABLE "list"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "task"`);
    }

}
