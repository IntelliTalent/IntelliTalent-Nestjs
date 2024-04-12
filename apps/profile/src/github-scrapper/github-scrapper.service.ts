import { Constants, getRedisUserNameReposKey } from '@app/shared';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';
import { ResponseScrapGithubProfileDto } from './dtos/scrap-github-profile.dto';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class GithubScrapperService {
  constructor(@InjectRedis() private readonly redis: Redis) {
    // this.scrapGithubProfile('mostafa-wael');
    this.getUserRepos('mostafa-wael');
  }

  async getOctokit() {
    const githubTokens = (
      await getConfigVariables(Constants.SCRAPPER.GITHUBTOKEN)
    ).split(',');

    const githubToken =
      githubTokens[Math.floor(Math.random() * githubTokens.length)];
    return new Octokit({ auth: githubToken });
  }

  async scrapGithubProfile(userName: string) {
    const octokit = await this.getOctokit();
    const { data } = await octokit.rest.users.getByUsername({
      username: userName,
    });
    const response: ResponseScrapGithubProfileDto = {
      avatar_url: data.avatar_url,
      html_url: data.html_url,
      repos_url: data.repos_url,
      name: data.name,
      company: data.company,
      blog: data.blog,
      location: data.location,
      email: data.email,
      bio: data.bio,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
    };
    this.storeUserRepos(userName);
    return response;
  }

  async storeUserRepos(userName: string) {
    let _hasNextPage = true;
    let pageNumber = 1;
    do {
      const { response, hasNextPage } = await this.scrapUserRepos(
        userName,
        pageNumber++,
      );
      _hasNextPage = hasNextPage;
      await Promise.all(
        response.map((repo) =>
          this.redis
            .multi()
            .lpush(getRedisUserNameReposKey(userName), JSON.stringify(repo))
            .expire(getRedisUserNameReposKey(userName), 3600)
            .exec(),
        ),
      );
      console.log('done storing repos', getRedisUserNameReposKey(userName));
    } while (_hasNextPage);
  }

  async getUserRepos(userName: string) {
    const repos = await this.redis.lrange(
      getRedisUserNameReposKey(userName),
      0,
      -1,
    );
    const response = repos.map((repo) => JSON.parse(repo));
    return response;
  }

  async scrapUserRepos(userName: string, pageNumber = 1, perPage = 10) {
    const octokit = await this.getOctokit();

    const { data } = await octokit.rest.repos.listForUser({
      username: userName,
      sort: 'created',
      direction: 'desc',
      per_page: perPage,
      page: pageNumber,
    });

    const languagesPromises = data.map(async (repo) => {
      const { data: languages } = await octokit.rest.repos.listLanguages({
        owner: userName,
        repo: repo.name,
      });
      return {
        repoName: repo.name,
        languages: Object.entries(languages).reduce(
          (acc, [language, bytes]) => {
            const percentage = (
              (bytes /
                Object.values(languages).reduce((sum, b) => sum + b, 0)) *
              100
            ).toFixed(2);
            acc[language] = `${percentage}%`;
            return acc;
          },
          {},
        ),
      };
    });

    const repoLanguages = await Promise.all(languagesPromises);

    const response = data.map((repo, index) => ({
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description,
      languages: repoLanguages[index].languages,
      forks_count: repo.forks_count,
      size: repo.size,
      stargazers_count: repo.stargazers_count,
      created_at: repo.created_at,
    }));
    return {
      response,
      hasNextPage: data.length === perPage,
    };
  }
}
