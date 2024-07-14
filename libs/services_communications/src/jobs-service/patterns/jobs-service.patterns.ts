export const jobsServicePatterns = {
  createJob: 'createJob',
  getJobs: 'getJobs',
  getJobById: 'getJobById',
  getJobDetailsById: 'getJobDetailsById',
  editJob: 'editJob',
  deactivateJob: 'deactivateJob',
  moveToNextStage: 'moveToNextStage',
  getUserJobs: 'getUserJobs',

  // patterns with other services
  extractInfo: 'extractInfo',
  match: 'match',
  checkActiveJobs: 'checkActiveJobs',
  beginCurrentStage: 'beginCurrentStage',
};

export const jobsServiceEvents = {
  userApply: 'userApply',
  jobExtractor: 'jobExtractor',
};
