import { SharedModule } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { EntityManager } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @Inject(ServiceName.AUTH_SERVICE) private readonly authService: ClientProxy,
    @Inject(ServiceName.USER_SERVICE) private readonly userService: ClientProxy,
    @Inject(ServiceName.COVER_LETTER_GENERATOR_SERVICE)
    private readonly coverLetterService: ClientProxy,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async clearDatabase() {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const tables = await queryRunner.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

      for (const {
        table_name: name,
      } of tables) {
        await queryRunner.query(`TRUNCATE TABLE "${name}" CASCADE`);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async gethealthCheck() {
    const pattern = { cmd: 'healthCheck' };
    const authHealth = await firstValueFrom(this.authService.send(pattern, {}));
    const userHealth = await firstValueFrom(this.userService.send(pattern, {}));
    const coverletterHealth = await firstValueFrom(
      this.coverLetterService.send(pattern, {}),
    );
    return {
      authHealth,
      userHealth,
      coverletterHealth,
    };
  }
}
