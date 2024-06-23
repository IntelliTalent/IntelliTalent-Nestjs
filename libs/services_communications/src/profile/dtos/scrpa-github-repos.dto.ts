import { ApiProperty } from "@nestjs/swagger";

export class GithubLanguage {  [key: string]: number;
}


export class ResponseScrapGithubRepoSto {
  @ApiProperty({ example: "inertiajs" })
  name: string;
  @ApiProperty({ example: "http:exasc" })
  html_url: string;
  @ApiProperty({ example: "The Modern Monolith" })
  description: string;

  @ApiProperty({
    type: GithubLanguage,
    example:{
      JavaScript: 49,
      TypeScript: 51,
    }
  })
  languages: GithubLanguage;
  @ApiProperty({ example: 0 })
  forks_count: number;
  @ApiProperty({ example: 0 })
  size: number;
  @ApiProperty({ example: 0 })
  stargazers_count: number;
  @ApiProperty({ example: "2021-03-11T13:51:46Z" })
  created_at: string;
}
