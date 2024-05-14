import { cvExtractorPattern } from '@app/services_communications/cv-extractor-service';
import { ServiceName } from '@app/shared';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Redis } from 'ioredis';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CvExtractorService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @Inject(ServiceName.CV_EXTRACTOR_SERVICE)
    private cvExtractorService: ClientProxy,
  ) {}

  private async saveInfo(userId: string, cvLink: string) {
    const data = await firstValueFrom(
      this.cvExtractorService.send(
        { cmd: cvExtractorPattern.extractInfo },
        { cvLink },
      ),
    );

    await this.redis.set(userId, JSON.stringify(data));
  }

  trigger(userId: string, cvLink: string) {
    this.saveInfo(userId, cvLink);

    return 'Data is currently being processed.';
  }

  async extractInfo(userId: string) {
    const data = await this.redis.get(userId);

    // Remove the user id from redis
    await this.redis.del(userId);

    return JSON.parse(data);
  }
}
