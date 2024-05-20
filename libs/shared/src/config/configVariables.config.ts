import { ConfigService } from '@nestjs/config';

export const PROD_ENVIRONMENT = 'production';
const STAGING_ENVIRONMENT = 'staging';
const LOCAL_ENVIRONMENT = 'local';
const TEST_ENVIRONMENT = 'test';
const ENV_CONSTANT = 'environment';

export const currentEnvironment = () => {
  const configService: ConfigService = new ConfigService();
  return configService.get(ENV_CONSTANT);
};

const getConfigVariables = (variableName: string) => {
  const environment = currentEnvironment();

  switch (environment) {
    case PROD_ENVIRONMENT:
    case STAGING_ENVIRONMENT:
    case LOCAL_ENVIRONMENT:
    case TEST_ENVIRONMENT:
    default:
      const configService: ConfigService = new ConfigService();
      return configService.get(variableName);
  }
};

export default getConfigVariables;
