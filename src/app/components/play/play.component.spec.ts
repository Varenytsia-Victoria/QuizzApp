import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PlayComponent } from './play.component';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from 'src/app/models/quiz.model';

describe('PlayComponent', () => {
  let component: PlayComponent;
  let fixture: ComponentFixture<PlayComponent>;
  let quizService: jasmine.SpyObj<QuizService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;

  beforeEach(async () => {
    const quizServiceSpy = jasmine.createSpyObj('QuizService', [
      'getQuizById',
      'saveAnswer',
      'startQuizTimer',
      'endQuizTimer',
      'setTotalTime',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [PlayComponent],
      providers: [
        { provide: QuizService, useValue: quizServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1', // Mock quizId as '1'
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayComponent);
    component = fixture.componentInstance;
    quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start the quiz timer on initialization', () => {
    spyOn(component, 'ngOnInit').and.callThrough();
    component.ngOnInit();
    expect(quizService.startQuizTimer).toHaveBeenCalled();
  });

  it('should load the quiz based on quizId', () => {
    const mockQuiz: Quiz = {
      id: '1',
      name: 'Test Quiz',
      questions: [
        {
          question: 'Test Question?',
          answers: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
        },
      ],
    };

    quizService.getQuizById.and.returnValue(of(mockQuiz));

    fixture.detectChanges();

    component.quiz$.subscribe((quiz) => {
      expect(quiz).toEqual(mockQuiz);
    });
    expect(quizService.getQuizById).toHaveBeenCalledWith('1');
  });

  it('should save the selected answer and move to the next question', () => {
    const mockQuiz: Quiz = {
      id: '1',
      name: 'Test Quiz',
      questions: [
        {
          question: 'Test Question?',
          answers: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
        },
      ],
    };

    quizService.getQuizById.and.returnValue(of(mockQuiz));

    component.selectedAnswer = 'A';
    fixture.detectChanges();

    component.onNextQuestion();

    expect(quizService.saveAnswer).toHaveBeenCalledWith('1', 0, 'A', 'A');
    expect(component.currentQuestionIndex).toBe(1);
  });

  it('should navigate to the finish page when the last question is answered', () => {
    const mockQuiz: Quiz = {
      id: '1',
      name: 'Test Quiz',
      questions: [
        {
          question: 'Test Question?',
          answers: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
        },
      ],
    };

    quizService.getQuizById.and.returnValue(of(mockQuiz));

    component.selectedAnswer = 'A';
    component.currentQuestionIndex = 0;

    fixture.detectChanges();

    component.onNextQuestion();

    expect(quizService.endQuizTimer).toHaveBeenCalled();
    expect(quizService.setTotalTime).toHaveBeenCalledWith(component.totalTime);
    expect(router.navigate).toHaveBeenCalledWith(['/finish'], {
      queryParams: { quizId: '1' },
    });
  });

  it('should cancel the quiz and navigate to the home page', () => {
    spyOn(component.timerSubscription, 'unsubscribe').and.callThrough();
    component.onCancelQuiz();

    expect(component.timerSubscription.unsubscribe).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should unsubscribe from the timer on destroy', () => {
    spyOn(component.timerSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.timerSubscription.unsubscribe).toHaveBeenCalled();
  });
});
