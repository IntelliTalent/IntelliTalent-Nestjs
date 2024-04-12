export const redisUserNameRepoString = 'user_name_repo';

export const getRedisUserNameReposKey = (userName: string) => {
  return `${redisUserNameRepoString}:${userName}`;
};
