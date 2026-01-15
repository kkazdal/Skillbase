import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddApiKeyExpiresAtToProjects1700000002000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'projects',
      new TableColumn({
        name: 'api_key_expires_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('projects', 'api_key_expires_at');
  }
}

