import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from 'src/app/models/quiz.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let quizService: jasmine.SpyObj<QuizService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const quizServiceSpy = jasmine.createSpyObj('QuizService', [
      'getQuizzes',
      'getRandomQuiz',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: QuizService, useValue: quizServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should get quizzes on init', () => {
    const mockQuizzes: Quiz[] = [
      { id: '1', name: 'Quiz 1', questions: [] },
      { id: '2', name: 'Quiz 2', questions: [] },
    ];
    quizService.getQuizzes.and.returnValue(of(mockQuizzes));

    fixture.detectChanges();

    component.quizzes$.subscribe((quizzes) => {
      expect(quizzes).toEqual(mockQuizzes);
    });
    expect(quizService.getQuizzes).toHaveBeenCalled();
  });

  it('should navigate to play quiz on onPlay call', () => {
    const quizId = '123';
    component.onPlay(quizId);
    expect(router.navigate).toHaveBeenCalledWith(['/play', quizId]);
  });

  it('should navigate to random quiz on onLuckyClick call', () => {
    const mockRandomQuiz: Quiz = {
      id: '999',
      name: 'Random Quiz',
      questions: [],
    };
    quizService.getRandomQuiz.and.returnValue(of(mockRandomQuiz));

    component.onLuckyClick();

    expect(quizService.getRandomQuiz).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/play', mockRandomQuiz.id]);
  });
});
