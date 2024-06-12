import getConfigVariables from './configVariables.config';
import { Constants } from './environment.constants';

export enum MongoDBName {
  ScrappedJobsDB = 'ScrappedJobsDB',
  FormFieldsDB = 'FormFieldsDB',
  QuizzesDB = 'QuizzesDB',
  InterviewQuestionsDB = 'InterviewQuestionsDB',
}

export const getMongoDatabase = async (dbName: MongoDBName) => {
  switch (dbName) {
    case MongoDBName.ScrappedJobsDB:
      return await getConfigVariables(Constants.MONGODB.dbName.ScrappedJobsDB);
    case MongoDBName.FormFieldsDB:
      return await getConfigVariables(Constants.MONGODB.dbName.FormFieldsDB);
    case MongoDBName.InterviewQuestionsDB:
      return await getConfigVariables(
        Constants.MONGODB.dbName.InterviewQuestionsDB,
      );
  }
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

  return url;
};
