import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import getConfigVariables from './configVariables.config';
import { RmqOptions, Transport } from '@nestjs/microservices';

export const Constants = {
  //basic app info
  APPPORT: 'NODE_PORT',
  BASEURL: 'APP_BASE_URL',
  //database values
  DB: {
    dbHost: 'DB_HOST',
    dbPort: 'DB_PORT',
    dbUserName: 'DB_USERNAME',
    dbPassword: 'DB_PASSWORD',
    dbName: {
      AUTHDB: 'AUTHDB',
      USERSDB: 'USERSDB',
    },
  },
  RABBITMQ: {
    HOST: 'RABBITMQ_HOST',
    PORT: 'RABBITMQ_PORT',
    USER: 'RABBITMQ_USER',
    PASSWORD: 'RABBITMQ_PASS',
  },
  QUEUES: {
    USER_QUEUE: 'RABBITMQ_AUTH_QUEUE',
    AUTH_QUEUE: 'RABBITMQ_USERS_QUEUE',
    COVER_LETTER_QUEUE: 'RABBITMQ_COVER_LETTER_QUEUE',
  },
  JWT: {
    secret: 'JWT_SECRET',
    expiresIn: 'JWT_EXPIRATION',
    salt: 'BCRYPT_SALT'
  }
};

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

export const getServiceDatabse = async (
  serviceName: ServiceName,
): Promise<TypeOrmModuleOptions> => {
  const configObject: TypeOrmModuleOptions = {
    type: 'postgres',
    host: await getConfigVariables(Constants.DB.dbHost),
    port: parseInt(await getConfigVariables(Constants.DB.dbPort)),
    username: await getConfigVariables(Constants.DB.dbUserName),
    password: await getConfigVariables(Constants.DB.dbPassword),
    synchronize: true, // Set to false in production
    retryAttempts: 15, // Number of times to retry connecting
    retryDelay: 10000, // Delay between connection retries (in milliseconds)
    connectTimeoutMS: 10000, // Connection timeout (in milliseconds)
  };

  switch (serviceName) {
    case ServiceName.API_GATEWAY:
      break;
    case ServiceName.AUTH_SERVICE:
      Object.assign(configObject, {
        database: await getConfigVariables(Constants.DB.dbName.AUTHDB),
      });
      break;

    case ServiceName.USER_SERVICE:
      Object.assign(configObject, {
        database: await getConfigVariables(Constants.DB.dbName.USERSDB),
      });
      break;
  }
  return configObject;
};

export enum ServiceName {
  API_GATEWAY = 'API_GATEWAY',
  USER_SERVICE = 'USER_SERVICE',
  AUTH_SERVICE = 'AUTH_SERVICE',
  COVER_LETTER_SERVICE = 'COVER_LETTER_SERVICE',
}

export async function mapServiceNameToQueueName(
  serviceName: ServiceName,
): Promise<string> {
  switch (serviceName) {
    case ServiceName.AUTH_SERVICE:
      return await getConfigVariables(Constants.QUEUES.AUTH_QUEUE);
    case ServiceName.USER_SERVICE:
      return await getConfigVariables(Constants.QUEUES.USER_QUEUE);
    case ServiceName.COVER_LETTER_SERVICE:
      return await getConfigVariables(Constants.QUEUES.COVER_LETTER_QUEUE);
  }
}
