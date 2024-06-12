export const quizzesPattern = {
  getQuiz: 'getQuiz', // Get a quiz by userId and JobId
  getQuizWithAnswers: 'getQuizWithAnswers', // Get a quiz with answers by userId and JobId
  getUsersScores: 'getUsersScores', // Get all users scores for a job
  getUserQuizzes: 'getUserQuizzes', // Get all quizzes for a user
};

export const quizzesEvents = {
  createQuiz: 'createQuiz', // Create a quiz for a user and job
  submitQuiz: 'submitQuiz', // Correct a quiz for a job
};

export const quizzesGeneratorPattern = {
  generateQuiz: 'generateQuiz', // Generate a quiz for a job
  generateQuizzes: 'generateNumberOfQuizzes', // Generate quizzes for a job
};
