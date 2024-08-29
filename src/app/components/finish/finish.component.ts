import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent implements OnInit {
  results$: Observable<any> | undefined;

  score!: number;
  correctAnswers!: number;
  totalTime!: number;
  averageTimePerQuestion: string = '0.00';
  correctAnswerPercentage: string = '0.00';

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const quizId = this.route.snapshot.queryParamMap.get('quizId');

    if (quizId) {
      this.results$ = this.quizService.getQuizResults(quizId);

      this.results$.subscribe((results) => {
        this.score = results.score;
        this.correctAnswers = results.correctAnswers;
        this.totalTime = results.totalTime;
        this.correctAnswerPercentage = results.correctAnswerPercentage;

        if (this.correctAnswers > 0) {
          this.averageTimePerQuestion = (
            this.totalTime / this.correctAnswers
          ).toFixed(2);
        } else {
          this.averageTimePerQuestion = '0.00';
        }
      });
    }
  }

  onRestartQuiz(): void {
    this.router.navigate(['/']);
  }
}
