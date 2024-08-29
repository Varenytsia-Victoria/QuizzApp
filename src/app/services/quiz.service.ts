import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, delay, retryWhen, switchMap } from 'rxjs/operators';
import { Quiz, Question } from '../models/quiz.model';
import { getCategoryName } from '../constants/quiz-types';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
  private correctAnswers: number = 0;
  private startTime: number = 0;
  private totalTime: number = 0;
  private totalTimeSubject = new BehaviorSubject<number>(0);
  private answers: { [quizId: string]: { [questionIndex: number]: boolean } } =
    {};
  private readonly baseUrl = 'https://opentdb.com/api.php';

  constructor(private http: HttpClient) {
    this.initializeSessionToken();
  }

  private sessionToken: string | null = null;

  private initializeSessionToken(): void {
    this.http
      .get<{ token: string }>(
        'https://opentdb.com/api_token.php?command=request'
      )
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch session token:', error);
          return of({ token: '' });
        })
      )
      .subscribe((response) => {
        this.sessionToken = response.token;
        this.initializeQuizzes();
      });
  }

  private initializeQuizzes(): void {
    const quizCreationPromises: Promise<void>[] = [];
    for (let i = 0; i < 10; i++) {
      quizCreationPromises.push(
        this.fetchQuizzesFromApi(i)
          .pipe(delay(i * 1000))
          .toPromise()
      );
    }
    Promise.all(quizCreationPromises).then(() => {
      console.log('All quizzes loaded');
    });
  }

  private fetchQuizzesFromApi(index: number): Observable<void> {
    const questionCount = Math.floor(Math.random() * 6) + 5;
    const category = this.getRandomCategory();
    const categoryName = getCategoryName(category);
    const difficulty = this.getRandomDifficulty();
    const type = this.getRandomType();
    const apiUrlWithToken = `${this.baseUrl}?amount=${questionCount}&category=${category}&difficulty=${difficulty}&type=${type}&token=${this.sessionToken}`;

    return this.http.get<{ results: any[] }>(apiUrlWithToken).pipe(
      map((response) => {
        if (response.results.length === 0) {
          throw new Error('No questions returned from API');
        }

        const questions: Question[] = response.results.map((data) => ({
          question: data.question,
          answers: [...data.incorrect_answers, data.correct_answer].sort(
            () => Math.random() - 0.5
          ),
          correctAnswer: data.correct_answer,
        }));

        const quiz: Quiz = {
          id: index.toString(),
          name: `${categoryName}`,
          questions,
        };
        this.quizzesSubject.next([...this.quizzesSubject.getValue(), quiz]);
      }),
      retryWhen((errors) =>
        errors.pipe(
          delay(1000),
          switchMap((error, retryCount) => {
            if (retryCount < 3) {
              return of(error);
            } else {
              console.error('Max retries reached. Could not load quiz.');
              return of(void 0);
            }
          })
        )
      ),
      catchError((error) => {
        console.error('API Error: ', error);
        return of(void 0);
      })
    );
  }

  getQuizzes(): Observable<Quiz[]> {
    return this.quizzesSubject.asObservable();
  }

  getQuizById(id: string): Observable<Quiz | undefined> {
    return this.quizzesSubject
      .asObservable()
      .pipe(map((quizzes) => quizzes.find((quiz) => quiz.id === id)));
  }

  getRandomQuiz(): Observable<Quiz | undefined> {
    return this.quizzesSubject.asObservable().pipe(
      map((quizzes) => {
        const randomIndex = Math.floor(Math.random() * quizzes.length);
        return quizzes[randomIndex];
      })
    );
  }

  saveAnswer(
    quizId: string,
    questionIndex: number,
    selectedAnswer: string,
    correctAnswer: string
  ): void {
    const currentQuiz = this.quizzesSubject
      .getValue()
      .find((quiz) => quiz.id === quizId);

    if (currentQuiz) {
      const question = currentQuiz.questions[questionIndex];
      if (question && selectedAnswer === correctAnswer) {
        this.correctAnswers++;
      }
    }
  }

  startQuizTimer(): void {
    this.startTime = Date.now();
  }

  endQuizTimer(): void {
    this.totalTime = Math.floor((Date.now() - this.startTime) / 1000);
  }

  getQuizResults(quizId: string): Observable<any> {
    const currentQuiz = this.quizzesSubject
      .getValue()
      .find((quiz) => quiz.id === quizId);

    if (currentQuiz) {
      const totalQuestions = currentQuiz.questions.length;
      const correctAnswers = this.correctAnswers;
      const totalTime = this.totalTime;
      const averageTimePerQuestion = this.totalTime / totalQuestions;
      const score = correctAnswers * (100 / totalQuestions);
      const correctAnswerPercentage =
        totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      return of({
        score,
        correctAnswers,
        totalTime,
        averageTimePerQuestion,
        correctAnswerPercentage: +correctAnswerPercentage.toFixed(2),
      });
    }
    return of({
      score: 0,
      correctAnswers: 0,
      totalTime: 0,
      averageTimePerQuestion: 0,
      correctAnswerPercentage: 0,
    });
  }
  resetQuizData(): void {
    this.answers = {};
    this.correctAnswers = 0;
    this.startTime = 0;
    this.totalTime = 0;
  }

  private getRandomCategory(): number {
    return Math.floor(Math.random() * (32 - 9 + 1)) + 9;
  }

  private getRandomDifficulty(): string {
    const difficulties = ['easy', 'medium', 'hard'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }

  private getRandomType(): string {
    const types = ['multiple', 'boolean'];
    return types[Math.floor(Math.random() * types.length)];
  }

  setTotalTime(time: number): void {
    this.totalTimeSubject.next(time);
  }

  getTotalTime(): Observable<number> {
    return this.totalTimeSubject.asObservable();
  }
}
