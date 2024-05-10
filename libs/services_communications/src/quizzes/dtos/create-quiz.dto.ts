export class CreateQuizDto {
  name: string;

  recruiterId: string;

  usersIds: string[];

  jobId: string;

  skills: string[];

  numberOfQuestions: number;

  deadline: Date;
}
