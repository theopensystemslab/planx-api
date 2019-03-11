import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDatabase1552333541408 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "creator_id" uuid, CONSTRAINT "UQ_de8536da4945fe980f4a61900d3" UNIQUE ("slug"), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "password" text NOT NULL, "team_id" uuid, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "operations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL DEFAULT 0, "data" jsonb NOT NULL, "flow_id" uuid, "actor_id" uuid, CONSTRAINT "PK_7b62d84d6f9912b975987165856" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "flows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "version" integer NOT NULL DEFAULT 0, "data" jsonb NOT NULL DEFAULT '{}', "team_id" uuid, "creator_id" uuid, CONSTRAINT "PK_c346955f4318ef565e6928462fe" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_42744d21c558ffeb2b57a1f6a1a" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_1208ee1db5ddb64b48a86b46a61" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "operations" ADD CONSTRAINT "FK_6e68773858ee775e3c996dce56a" FOREIGN KEY ("flow_id") REFERENCES "flows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "operations" ADD CONSTRAINT "FK_d5cf99babfaa5e7aa201e793708" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "flows" ADD CONSTRAINT "FK_73e092d7da622ac5188729ee6c5" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "flows" ADD CONSTRAINT "FK_db188fa9816b9cacbe563b8c086" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "flows" DROP CONSTRAINT "FK_db188fa9816b9cacbe563b8c086"`
    )
    await queryRunner.query(
      `ALTER TABLE "flows" DROP CONSTRAINT "FK_73e092d7da622ac5188729ee6c5"`
    )
    await queryRunner.query(
      `ALTER TABLE "operations" DROP CONSTRAINT "FK_d5cf99babfaa5e7aa201e793708"`
    )
    await queryRunner.query(
      `ALTER TABLE "operations" DROP CONSTRAINT "FK_6e68773858ee775e3c996dce56a"`
    )
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_1208ee1db5ddb64b48a86b46a61"`
    )
    await queryRunner.query(
      `ALTER TABLE "teams" DROP CONSTRAINT "FK_42744d21c558ffeb2b57a1f6a1a"`
    )
    await queryRunner.query(`DROP TABLE "flows"`)
    await queryRunner.query(`DROP TABLE "operations"`)
    await queryRunner.query(`DROP TABLE "users"`)
    await queryRunner.query(`DROP TABLE "teams"`)
  }
}
