export class ResponseScrapGithubRepoSto {
  name: string;
  html_url: string;
  description: string;
  languages: GithubLanguage;
  forks_count: number;
  size: number;
  stargazers_count: number;
  created_at: string;
}

export class GithubLanguage {
  [key: string]: number;
}
