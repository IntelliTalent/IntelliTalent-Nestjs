import { RmqOptions, Transport } from '@nestjs/microservices';
import getConfigVariables from './configVariables.config';
import { Constants } from './environment.constants';

export const getRMQConfig = async () => {
  const USER = await getConfigVariables(Constants.RABBITMQ.USER);
  const PASSWORD = await getConfigVariables(Constants.RABBITMQ.PASSWORD);
  const HOST = await getConfigVariables(Constants.RABBITMQ.HOST);
  const PORT = await getConfigVariables(Constants.RABBITMQ.PORT);
  return {
    USER,
    PASSWORD,
    HOST,
    PORT,
  };
};

export const getRabbitMQOptions = async (
  queue: string,
): Promise<RmqOptions> => {
  const { HOST, PASSWORD, PORT, USER } = await getRMQConfig();

  return {
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${USER}:${PASSWORD}@${HOST}:${PORT}`],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
};
