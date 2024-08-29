import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Observable } from 'rxjs';
import { Quiz } from 'src/app/models/quiz.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  quizzes$: Observable<Quiz[]>;

  constructor(private quizService: QuizService, private router: Router) {
    this.quizzes$ = this.quizService.getQuizzes();
  }

  onPlay(quizId: string): void {
    this.router.navigate(['/play', quizId]);
  }

  onLuckyClick(): void {
    this.quizService.getRandomQuiz().subscribe((randomQuiz) => {
      if (randomQuiz) {
        this.router.navigate(['/play', randomQuiz.id]);
      }
    });
  }
}
