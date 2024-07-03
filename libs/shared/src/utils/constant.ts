import getConfigVariables, { TEST_ENVIRONMENT } from "../config/configVariables.config"
import { Constants } from "../config/environment.constants";

export const SeederEvent = 'seeder-event'


export const AVAILABLE_JOB_TITLES = ['ai engineer', 'backend engineer', 'cloud engineer', 'cyber security engineer', 'data analyst', 'data engineer', 'data scientist', 'database administrator', 'database analyst', 'devops engineer', 'front end developer', 'full stack developer', 'it specialist', 'java developer', 'machine learning engineer', 'mobile app developer', 'network administrator', 'network engineer', 'python engineer', 'software developer', 'software engineer', 'support engineer', 'system administrator', 'systems analyst', 'systems engineer', 'ux designer', 'web developer']



export const testingMode  = () => {
    return getConfigVariables(Constants.NODE_ENV) == TEST_ENVIRONMENT
};
