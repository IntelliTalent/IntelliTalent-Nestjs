import { RmqContext, RmqOptions } from '@nestjs/microservices';

export interface SharedServiceInterface {
  getRmqOptions(queue: string): Promise<RmqOptions>;
  acknowledgeMessage(context: RmqContext): void;
}
