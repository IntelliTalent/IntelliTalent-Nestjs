import getConfigVariables from "./configVariables.config";
import { Constants } from "./environment.constants";

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
