import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import getConfigVariables from './configVariables.config';

export const Constants = {
  //basic app info
  APPPORT: 'APP_PORT',
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
      BOOKSDB: 'BOOKSDB',
      MONITORINGDB: 'MONITORINGDB',
    },
  },
  RABBITMQ: {
    url: 'RABBIT_MQ_URL',
  },
};

export enum ServiceName {
  API_GATEWAY = 'API_GATEWAY',
  USER_SERVICE = 'USER_SERVICE',
  AUTH_SERVICE = 'AUTH_SERVICE',
}

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

export enum QueuesName {
  USER_QUEUE = 'USER_QUEUE',
  AUTH_QUEUE = 'AUTH_QUEUE',
  BOOKS_QUEUE = 'BOOKS_QUEUE',
  MONITORING_QUEUE = 'MONITORING_QUEUE',
}
