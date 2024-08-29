import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Observable, Subscription, interval } from 'rxjs';
import { Quiz } from 'src/app/models/quiz.model';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
})
export class PlayComponent implements OnInit, OnDestroy {
  quiz$: Observable<Quiz | undefined>;
  currentQuestionIndex = 0;
  selectedAnswer: string | null = null;
  totalTime = 0;
  timerSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private router: Router
  ) {
    const quizId = this.route.snapshot.paramMap.get('quizId');
    this.quiz$ = quizId
      ? this.quizService.getQuizById(quizId)
      : new Observable<Quiz | undefined>();
  }

  ngOnInit(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.totalTime++;
    });

    this.quizService.startQuizTimer();
  }

  onAnswerSelect(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target && target.value) {
      this.selectedAnswer = target.value;
    }
  }

  onNextQuestion(): void {
    if (this.selectedAnswer) {
      this.quiz$.subscribe((quiz) => {
        if (quiz && this.currentQuestionIndex < quiz.questions.length) {
          const correctAnswer =
            quiz.questions[this.currentQuestionIndex].correctAnswer;
          this.quizService.saveAnswer(
            quiz.id,
            this.currentQuestionIndex,
            this.selectedAnswer!,
            correctAnswer
          );
          this.selectedAnswer = null;
          this.currentQuestionIndex++;

          if (this.currentQuestionIndex >= quiz.questions.length) {
            this.timerSubscription.unsubscribe();
            this.quizService.endQuizTimer();
            this.quizService.setTotalTime(this.totalTime);
            this.router.navigate(['/finish'], {
              queryParams: { quizId: quiz.id },
            });
          }
        }
      });
    }
  }

  onCancelQuiz(): void {
    this.timerSubscription.unsubscribe();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
