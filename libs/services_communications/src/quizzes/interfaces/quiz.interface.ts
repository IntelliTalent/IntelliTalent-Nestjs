export interface GeneratedQuizQuestion {
  context: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  codeblock: string;
}

export interface GeneratedQuiz {
  questions: GeneratedQuizQuestion[];
}
