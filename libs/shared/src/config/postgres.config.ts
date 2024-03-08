import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Constants, ServiceName } from './environment.constants';
import getConfigVariables from './configVariables.config';

export const getServiceDatabse = async (
  serviceName: ServiceName,
): Promise<TypeOrmModuleOptions> => {
  const configObject: TypeOrmModuleOptions = {
    type: 'postgres',
    host: await getConfigVariables(Constants.DB.dbHost),
    port: parseInt(await getConfigVariables(Constants.DB.dbPort)),
    username: await getConfigVariables(Constants.DB.dbUserName),
    password: await getConfigVariables(Constants.DB.dbPassword),
    autoLoadEntities: true,
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
    case ServiceName.PROFILE_SERVICE:
      Object.assign(configObject, {
        database: await getConfigVariables(Constants.DB.dbName.PROFILEDB),
      });
      break;
    case ServiceName.JOB_SERVICE:
      Object.assign(configObject, {
        database: await getConfigVariables(Constants.DB.dbName.STRUCTUREJOBSDB),
      });

  }
  return configObject;
};

