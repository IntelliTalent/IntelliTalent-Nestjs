export class UserQuizDetailsDto {
  userId: string;

  email: string;
}

export class CreateQuizDto {
  usersDetails: UserQuizDetailsDto[];

  name: string;

  recruiterId: string;

  jobId: string;

  skills: string[];

  numberOfQuestions: number;

  deadline: Date;
}
