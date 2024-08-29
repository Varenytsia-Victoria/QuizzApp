import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FinishComponent } from './finish.component';
import { QuizService } from '../../services/quiz.service';

describe('FinishComponent', () => {
  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;
  let quizService: jasmine.SpyObj<QuizService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    const quizServiceSpy = jasmine.createSpyObj('QuizService', [
      'getQuizResults',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRoute = {
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue('testQuizId'),
        },
      },
    } as any;

    await TestBed.configureTestingModule({
      declarations: [FinishComponent],
      providers: [
        { provide: QuizService, useValue: quizServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FinishComponent);
    component = fixture.componentInstance;
    quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch quiz results on init', () => {
    const mockResults = {
      score: 80,
      correctAnswers: 8,
      totalTime: 120,
      correctAnswerPercentage: '80.00',
    };
    quizService.getQuizResults.and.returnValue(of(mockResults));

    fixture.detectChanges();

    expect(quizService.getQuizResults).toHaveBeenCalledWith('testQuizId');
    expect(component.score).toBe(mockResults.score);
    expect(component.correctAnswers).toBe(mockResults.correctAnswers);
    expect(component.totalTime).toBe(mockResults.totalTime);
    expect(component.correctAnswerPercentage).toBe(
      mockResults.correctAnswerPercentage
    );
    expect(component.averageTimePerQuestion).toBe('15.00');
  });

  it('should calculate average time per question correctly when there are correct answers', () => {
    const mockResults = {
      score: 80,
      correctAnswers: 8,
      totalTime: 120,
      correctAnswerPercentage: '80.00',
    };
    quizService.getQuizResults.and.returnValue(of(mockResults));

    fixture.detectChanges();

    expect(component.averageTimePerQuestion).toBe('15.00');
  });

  it('should set average time per question to 0.00 when there are no correct answers', () => {
    const mockResults = {
      score: 0,
      correctAnswers: 0,
      totalTime: 120,
      correctAnswerPercentage: '0.00',
    };
    quizService.getQuizResults.and.returnValue(of(mockResults));

    fixture.detectChanges();

    expect(component.averageTimePerQuestion).toBe('0.00');
  });

  it('should navigate to home on restart', () => {
    component.onRestartQuiz();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
