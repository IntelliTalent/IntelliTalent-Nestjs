export const redisUserNameRepoString = 'user_name_repo';
export const redisLinkedinProfileString = 'linkedin_profile';

export const getRedisUserNameReposKey = (userName: string): string => {
  return `${redisUserNameRepoString}:${userName}`;
};

export const getLinkedinProfileKey = (username: string): string => {
  return `${redisLinkedinProfileString}:${username}`;
}

