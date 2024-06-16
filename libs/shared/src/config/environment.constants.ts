import getConfigVariables from './configVariables.config';

export const Constants = {
  //basic app info
  APPPORT: 'NODE_PORT',
  BASEURL: 'APP_BASE_URL',
  FRONT_END_URL: 'FRONT_END_URL',
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
      QUIZDB: 'QuizzesDB',
      TESTINGDB: 'TestingDB',
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
      InterviewQuestionsDB: 'InterviewQuestionsDB',
      FilterationDB: 'FilterationDB',
    },
  },
  REDIS: {
    HOST: 'REDIS_HOST',
    PORT: 'REDIS_PORT',
    PASSWORD: 'REDIS_PASSWORD',
    dbName: {
      mailingDB: 'REDIS_MAILING_DB',
      jobsDB: 'REDIS_JOBS_DB',
      profiles_DB: 'REDIS_PROFILES_DB',
      testingDB1: 'REDIS_TESTING_DB_1',
      testingDB2: 'REDIS_TESTING_DB_2',
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
    COVER_LETTER_GENERATOR_QUEUE: 'RABBITMQ_COVER_LETTER_GENERATOR_QUEUE',
    CV_GENERATOR_QUEUE: 'RABBITMQ_CV_GENERATOR_QUEUE',
    CV_EXTRACTOR_QUEUE: 'RABBITMQ_CV_EXTRACTOR_QUEUE',
    ATS_QUEUE: 'RABBITMQ_ATS_QUEUE',
    AUTOFILL_QUEUE: 'RABBITMQ_AUTOFILL_QUEUE',
    JOB_QUEUE: 'RABBITMQ_JOB_QUEUE',
    NOTIFIER_QUEUE: 'RABBITMQ_NOTIFIER_QUEUE',
    PROFILE_QUEUE: 'RABBITMQ_PROFILE_QUEUE',
    FILTRATION_QUEUE: 'RABBITMQ_FILTRATION_QUEUE',
    SCRAPPER_QUEUE: 'RABBITMQ_SCRAPPER_QUEUE',
    JOB_EXTRACTOR_QUEUE: 'RABBITMQ_JOB_EXTRACTOR_QUEUE',
    QUIZ_QUEUE: 'RABBITMQ_QUIZ_QUEUE',
    QUIZ_GENERATOR_QUEUE: 'RABBITMQ_QUIZ_GENERATOR_QUEUE',
    CUSTOM_JOB_QUEUE: 'RABBITMQ_CUSTOM_JOB_QUEUE',
  },
  JWT: {
    secret: 'JWT_SECRET',
    expiresIn: 'JWT_EXPIRATION',
    salt: 'BCRYPT_SALT',
    forgetPasswordExpiresIn: 'FORGET_PASSWORD_EXPIRATION',
    forgetPasswordSecret: 'FORGET_PASSWORD_SECRET',
    verifyEmailExpiresIn: 'VERIFY_EMAIL_EXPIRATION',
    verifyEmailSecret: 'VERIFY_EMAIL_SECRET',
  },
  SCRAPPER: {
    GITHUBTOKEN: 'GITHUB_TOKENS',
    RAPIDAPI_KEY: 'RAPIDAPI_KEY',
  },
  EMAIL: {
    host: 'EMAIL_HOST',
    port: 'EMAIL_PORT',
    user: 'EMAIL_USERNAME',
    pass: 'EMAIL_PASSWORD',
  },
  AZURE: {
    AZURE_STORAGE_CONNECTION: 'AZURE_STORAGE_CONNECTION',
    AZURE_STORAGE_CONTAINER: 'AZURE_STORAGE_CONTAINER',
  },
};

export enum ServiceName {
  API_GATEWAY = 'API_GATEWAY',
  USER_SERVICE = 'USER_SERVICE',
  AUTH_SERVICE = 'AUTH_SERVICE',
  COVER_LETTER_GENERATOR_SERVICE = 'COVER_LETTER_GENERATOR_SERVICE',
  CV_GENERATOR_SERVICE = 'CV_GENERATOR_SERVICE',
  CV_EXTRACTOR_SERVICE = 'CV_EXTRACTOR_SERVICE',
  ATS_SERVICE = 'ATS_SERVICE',
  AUTOFILL_SERVICE = 'AUTOFILL_SERVICE',
  JOB_SERVICE = 'JOB_SERVICE',
  NOTIFIER_SERVICE = 'NOTIFIER_SERVICE',
  PROFILE_SERVICE = 'PROFILE_SERVICE',
  FILTERATION_SERVICE = 'FILTERATION_SERVICE',
  CUSTOM_JOB_SERVICE = 'CUSTOM_JOB_SERVICE',
  SCRAPPER_SERVICE = 'SCRAPPER_SERVICE',
  JOB_EXTRACTOR_SERVICE = 'JOB_EXTRACTOR_SERVICE',
  QUIZ_SERVICE = 'QUIZ_SERVICE',
  QUIZ_GENERATOR_SERVICE = 'QUIZ_GENERATOR_SERVICE',
  TESTING_DATABASE = 'TESTING_DATABASE',
}

export async function mapServiceNameToQueueName(
  serviceName: ServiceName,
): Promise<string> {
  switch (serviceName) {
    case ServiceName.AUTH_SERVICE:
      return await getConfigVariables(Constants.QUEUES.AUTH_QUEUE);
    case ServiceName.USER_SERVICE:
      return await getConfigVariables(Constants.QUEUES.USER_QUEUE);
    case ServiceName.COVER_LETTER_GENERATOR_SERVICE:
      return await getConfigVariables(
        Constants.QUEUES.COVER_LETTER_GENERATOR_QUEUE,
      );
    case ServiceName.CV_GENERATOR_SERVICE:
      return await getConfigVariables(Constants.QUEUES.CV_GENERATOR_QUEUE);
    case ServiceName.CV_EXTRACTOR_SERVICE:
      return await getConfigVariables(Constants.QUEUES.CV_EXTRACTOR_QUEUE);
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
    case ServiceName.FILTERATION_SERVICE:
      return await getConfigVariables(Constants.QUEUES.FILTRATION_QUEUE);
    case ServiceName.SCRAPPER_SERVICE:
      return await getConfigVariables(Constants.QUEUES.SCRAPPER_QUEUE);
    case ServiceName.JOB_EXTRACTOR_SERVICE:
      return await getConfigVariables(Constants.QUEUES.JOB_EXTRACTOR_QUEUE);
    case ServiceName.QUIZ_SERVICE:
      return await getConfigVariables(Constants.QUEUES.QUIZ_QUEUE);
    case ServiceName.QUIZ_GENERATOR_SERVICE:
      return await getConfigVariables(Constants.QUEUES.QUIZ_GENERATOR_QUEUE);
    case ServiceName.CUSTOM_JOB_SERVICE:
      return await getConfigVariables(Constants.QUEUES.CUSTOM_JOB_QUEUE);
  }
}
