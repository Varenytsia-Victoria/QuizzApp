import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { QuizService } from './quiz.service';
import { Quiz, Question } from '../models/quiz.model';
import { of, throwError } from 'rxjs';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuizService],
    });

    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize session token and load quizzes', () => {
    const mockTokenResponse = { token: 'mockToken' };
    const mockQuizResponse = {
      results: [
        {
          question: 'Sample Question',
          correct_answer: 'Correct Answer',
          incorrect_answers: ['Wrong Answer 1', 'Wrong Answer 2'],
        },
      ],
    };

    service['initializeSessionToken']();

    const tokenReq = httpMock.expectOne(
      'https://opentdb.com/api_token.php?command=request'
    );
    expect(tokenReq.request.method).toBe('GET');
    tokenReq.flush(mockTokenResponse);

    service.getQuizzes().subscribe((quizzes) => {
      expect(quizzes.length).toBeGreaterThan(0);
    });

    const quizReq = httpMock.expectOne(
      'https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple&token=mockToken'
    );
    expect(quizReq.request.method).toBe('GET');
    quizReq.flush(mockQuizResponse);
  });

  it('should handle API errors gracefully', () => {
    spyOn(service['http'], 'get').and.returnValue(
      throwError(() => new Error('API Error'))
    );

    service['initializeSessionToken']();

    const req = httpMock.expectOne(
      'https://opentdb.com/api_token.php?command=request'
    );
    expect(req.request.method).toBe('GET');
    req.flush('', { status: 500, statusText: 'Server Error' });

    service.getQuizzes().subscribe((quizzes) => {
      expect(quizzes.length).toBe(0);
    });
  });

  it('should calculate quiz results correctly', () => {
    const mockQuiz: Quiz = {
      id: '1',
      name: 'Sample Quiz',
      questions: [
        {
          question: 'Sample Question',
          answers: ['Wrong Answer 1', 'Wrong Answer 2', 'Correct Answer'],
          correctAnswer: 'Correct Answer',
        },
      ],
    };

    service['quizzesSubject'].next([mockQuiz]);
    service['correctAnswers'] = 1;
    service['totalTime'] = 60;

    service.getQuizResults('1').subscribe((results) => {
      expect(results.score).toBe(100);
      expect(results.correctAnswers).toBe(1);
      expect(results.totalTime).toBe(60);
      expect(results.averageTimePerQuestion).toBe('60.00');
      expect(results.correctAnswerPercentage).toBe(100);
    });
  });

  it('should reset quiz data correctly', () => {
    service['answers'] = { '1': { 0: true } };
    service['correctAnswers'] = 5;
    service['startTime'] = 1000;
    service['totalTime'] = 200;

    service.resetQuizData();

    expect(service['answers']).toEqual({});
    expect(service['correctAnswers']).toBe(0);
    expect(service['startTime']).toBe(0);
    expect(service['totalTime']).toBe(0);
  });

  it('should return quizzes observable', () => {
    const mockQuiz: Quiz = {
      id: '1',
      name: 'Sample Quiz',
      questions: [
        {
          question: 'Sample Question',
          answers: ['Wrong Answer 1', 'Wrong Answer 2', 'Correct Answer'],
          correctAnswer: 'Correct Answer',
        },
      ],
    };

    service['quizzesSubject'].next([mockQuiz]);

    service.getQuizzes().subscribe((quizzes) => {
      expect(quizzes.length).toBe(1);
      expect(quizzes[0].id).toBe('1');
    });
  });

  it('should return quiz by ID', () => {
    const mockQuiz: Quiz = {
      id: '1',
      name: 'Sample Quiz',
      questions: [
        {
          question: 'Sample Question',
          answers: ['Wrong Answer 1', 'Wrong Answer 2', 'Correct Answer'],
          correctAnswer: 'Correct Answer',
        },
      ],
    };

    service['quizzesSubject'].next([mockQuiz]);

    service.getQuizById('1').subscribe((quiz) => {
      expect(quiz).toEqual(mockQuiz);
    });
  });

  it('should return a random quiz', () => {
    const mockQuizzes: Quiz[] = [
      {
        id: '1',
        name: 'Sample Quiz 1',
        questions: [
          {
            question: 'Sample Question 1',
            answers: ['Wrong Answer 1', 'Correct Answer'],
            correctAnswer: 'Correct Answer',
          },
        ],
      },
      {
        id: '2',
        name: 'Sample Quiz 2',
        questions: [
          {
            question: 'Sample Question 2',
            answers: ['Wrong Answer 2', 'Correct Answer'],
            correctAnswer: 'Correct Answer',
          },
        ],
      },
    ];

    service['quizzesSubject'].next(mockQuizzes);
  });

  it('should save correct answers', () => {
    const mockQuiz: Quiz = {
      id: '1',
      name: 'Sample Quiz',
      questions: [
        {
          question: 'Sample Question',
          answers: ['Wrong Answer 1', 'Wrong Answer 2', 'Correct Answer'],
          correctAnswer: 'Correct Answer',
        },
      ],
    };

    service['quizzesSubject'].next([mockQuiz]);
    service.saveAnswer('1', 0, 'Correct Answer', 'Correct Answer');

    expect(service['correctAnswers']).toBe(1);
  });

  it('should start and end quiz timer correctly', () => {
    service.startQuizTimer();
    const startTime = service['startTime'];
    expect(startTime).toBeGreaterThan(0);

    service.endQuizTimer();
    const totalTime = service['totalTime'];
    expect(totalTime).toBeGreaterThan(0);
  });

  it('should set and get total time', () => {
    const totalTime = 120;
    service.setTotalTime(totalTime);

    service.getTotalTime().subscribe((time) => {
      expect(time).toBe(totalTime);
    });
  });

  it('should handle retry logic when fetching quizzes', () => {
    const mockTokenResponse = { token: 'mockToken' };
    const mockQuizResponse = {
      results: [
        {
          question: 'Sample Question',
          correct_answer: 'Correct Answer',
          incorrect_answers: ['Wrong Answer 1', 'Wrong Answer 2'],
        },
      ],
    };

    service['initializeSessionToken']();

    const tokenReq = httpMock.expectOne(
      'https://opentdb.com/api_token.php?command=request'
    );
    expect(tokenReq.request.method).toBe('GET');
    tokenReq.flush(mockTokenResponse);

    const quizReq = httpMock.expectOne(
      'https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple&token=mockToken'
    );
    expect(quizReq.request.method).toBe('GET');
    quizReq.flush('', { status: 500, statusText: 'Server Error' });

    service.getQuizzes().subscribe((quizzes) => {
      expect(quizzes.length).toBe(0);
    });
  });
});
