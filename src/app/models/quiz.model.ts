export interface Quiz {
  id: string;
  name: string;
  questions: Question[];
}

export interface Question {
  question: string;
  answers: string[];
  correctAnswer: string;
}
