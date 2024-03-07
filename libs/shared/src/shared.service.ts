import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions } from '@nestjs/microservices';
import { SharedServiceInterface } from './interfaces/shared.service.interface';
import { getRabbitMQOptions } from './config/rabbitmq.config';

@Injectable()
export class SharedService implements SharedServiceInterface {
  constructor(private readonly configService: ConfigService) {}

  /**
   * getRmqOptions is a method in the SharedService class.
   * It is used to generate the options for connecting to a RabbitMQ server as general between all microservices.
   *
   * @param queue - A string representing the name of the RabbitMQ queue to connect to.
   *
   * @returns An object of type RmqOptions, which is used to configure the connection to the RabbitMQ server among all services in the arch.
   *
   */

  async getRmqOptions(queue: string): Promise<RmqOptions> {
    return await getRabbitMQOptions(queue);
  }

  /**
   * acknowledgeMessage is a method in the SharedService class.
   * It is used to send an acknowledgment back to the RabbitMQ channel that a message has been received and processed successfully.
   *
   * @param context - An instance of the RmqContext class. This object provides methods to access the underlying RabbitMQ channel and message.
   *
   * The acknowledgeMessage method does the following:
   * - Retrieves a reference to the RabbitMQ channel that the current message came from using the getChannelRef method of the context object.
   * - Retrieves the current message that is being processed using the getMessage method of the context object.
   * - Sends an acknowledgment back to the RabbitMQ channel using the ack method of the channel object. This lets the sender know that the message was received and processed successfully.
   */
  acknowledgeMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
  }
}
