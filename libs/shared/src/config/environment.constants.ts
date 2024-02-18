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
      PROFILEDB: 'ProfileDB',
      STRUCTUREJOBSDB: 'StructuredJobsDB',
      MATCHESDB: 'MatchesDB',
      FILTERATIONDB: 'FilterationDB',
      CVSDB: 'CVSDB',
    },
  },
  MONGODB: {
    MONGO_INITDB_ROOT_USERNAME: 'MONGO_INITDB_ROOT_USERNAME',
    MONGO_INITDB_ROOT_PASSWORD: 'MONGO_INITDB_ROOT_PASSWORD',
    MONGO_INITDB_ROOT_DATABASE: 'MONGO_INITDB_ROOT_DATABASE',
    MONGODB_HOST: 'MONGODB_HOST',
    MONGODB_PORT: 'MONGODB_PORT',
    dbName: {
      ScrappedJobsDB: 'ScrappedJobsDB',
      FormFieldsDB: 'FormFieldsDB',
      QuizzesDB: 'QuizzesDB',
      InterviewQuestionsDB: 'InterviewQuestionsDB',
    },
  },
  REDIS: {
    HOST: 'REDIS_HOST',
    PORT: 'REDIS_PORT',
    PASSWORD: 'REDIS_PASSWORD',
    dbName: {
      mailingDB: 'REDIS_MAILING_DB',
      jobsDB: 'REDIS_JOBS_DB',
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
    ATS_QUEUE: 'RABBITMQ_ATS_QUEUE',
    AUTOFILL_QUEUE: 'RABBITMQ_AUTOFILL_QUEUE',
    JOB_QUEUE: 'RABBITMQ_JOB_QUEUE',
    NOTIFIER_QUEUE: 'RABBITMQ_NOTIFIER_QUEUE',
    PROFILE_QUEUE: 'RABBITMQ_PROFILE_QUEUE',
  },
  JWT: {
    secret: 'JWT_SECRET',
    expiresIn: 'JWT_EXPIRATION',
    salt: 'BCRYPT_SALT',
  },
};

export const getMongoDBConfig = async () => {
  const MONGO_INITDB_ROOT_USERNAME = await getConfigVariables(
    Constants.MONGODB.MONGO_INITDB_ROOT_USERNAME,
  );
  const MONGO_INITDB_ROOT_PASSWORD = await getConfigVariables(
    Constants.MONGODB.MONGO_INITDB_ROOT_PASSWORD,
  );
  const MONGO_INITDB_ROOT_DATABASE = await getConfigVariables(
    Constants.MONGODB.MONGO_INITDB_ROOT_DATABASE,
  );
  const MONGODB_HOST = await getConfigVariables(Constants.MONGODB.MONGODB_HOST);
  const MONGODB_PORT = await getConfigVariables(Constants.MONGODB.MONGODB_PORT);

  return {
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGO_INITDB_ROOT_DATABASE,
    MONGODB_HOST,
    MONGODB_PORT,
  };
};

export const getMongoUrl = async (dbName: string) => {
  const {
    MONGODB_HOST,
    MONGODB_PORT,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGO_INITDB_ROOT_USERNAME,
  } = await getMongoDBConfig();
  const url = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/`;
  console.log('waer ', url);

  return url;
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

export enum RedisDBName {
  mailingDB = 'mailingDB',
  jobsDB = 'jobsDB',
}

export const getRedisDatabase = async (dbName: RedisDBName) => {
  switch (dbName) {
    case RedisDBName.mailingDB:
      return await getConfigVariables(Constants.REDIS.dbName.mailingDB);
    case RedisDBName.jobsDB:
      return await getConfigVariables(Constants.REDIS.dbName.jobsDB);
  }
};

export const getRedisConfig = async () => {
  const HOST = await getConfigVariables(Constants.REDIS.HOST);
  const PORT = await getConfigVariables(Constants.REDIS.PORT);
  const PASSWORD = await getConfigVariables(Constants.REDIS.PASSWORD);
  return {
    HOST,
    PORT,
    PASSWORD,
  };
};

export enum MonogoDBName {
  ScrappedJobsDB = 'ScrappedJobsDB',
  FormFieldsDB = 'FormFieldsDB',
  QuizzesDB = 'QuizzesDB',
  InterviewQuestionsDB = 'InterviewQuestionsDB',
}

export const getMongoDatabase = async (dbName: MonogoDBName) => {
  switch (dbName) {
    case MonogoDBName.ScrappedJobsDB:
      return await getConfigVariables(Constants.MONGODB.dbName.ScrappedJobsDB);
    case MonogoDBName.FormFieldsDB:
      return await getConfigVariables(Constants.MONGODB.dbName.FormFieldsDB);
    case MonogoDBName.QuizzesDB:
      return await getConfigVariables(Constants.MONGODB.dbName.QuizzesDB);
    case MonogoDBName.InterviewQuestionsDB:
      return await getConfigVariables(
        Constants.MONGODB.dbName.InterviewQuestionsDB,
      );
  }
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
  ATS_SERVICE = 'ATS_SERVICE',
  AUTOFILL_SERVICE = 'AUTOFILL_SERVICE',
  JOB_SERVICE = 'JOB_SERVICE',
  NOTIFIER_SERVICE = 'NOTIFIER_SERVICE',
  PROFILE_SERVICE = 'PROFILE_SERVICE',
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
    case ServiceName.ATS_SERVICE:
      return await getConfigVariables(Constants.QUEUES.ATS_QUEUE);
    case ServiceName.AUTOFILL_SERVICE:
      return await getConfigVariables(Constants.QUEUES.AUTOFILL_QUEUE);
    case ServiceName.JOB_SERVICE:
      return await getConfigVariables(Constants.QUEUES.JOB_QUEUE);
    case ServiceName.NOTIFIER_SERVICE:
      return await getConfigVariables(Constants.QUEUES.NOTIFIER_QUEUE);
    case ServiceName.PROFILE_SERVICE:
      return await getConfigVariables(Constants.QUEUES.PROFILE_QUEUE);
  }
}
