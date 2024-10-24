
# QuizApp

QuizApp is an engaging web application that allows users to take quizzes on various topics. Built with modern web technologies, it provides an interactive experience while testing users' knowledge.

## 🌟 Features

- **Three Pages**:
  - **Home**: Displays a list of available quizzes and a random quiz button.
  - **Play**: A dedicated page for answering questions in a selected quiz.
  - **Finish**: Displays the results and statistics after completing a quiz.

- **Dynamic Quiz Generation**: 
  - Upon initialization, the app fetches random questions from the Trivia API and dynamically generates 10 quizzes.

- **Quiz Information Display**:
  - Each quiz item shows the quiz name, the number of questions, and a play button.

- **User Interaction**:
  - Users can click the "I'm Lucky" button on the Home page to select a random quiz.
  - While playing, users can answer questions and cancel the quiz to return to the Home page.
  - Users must select an answer before proceeding to the next question.
  - After answering the last question, users are navigated to the Finish page, where they can view their statistics, including:
    - Points scored
    - Number of correct answers
    - Time taken
    - Additional statistical options.

## 🛠 Technologies Used

- **Frontend**:
  - HTML
  - SCSS
  - Tailwind CSS
  - Angular
  - Angular Material
  - TypeScript
  - RxJS
  - Signals
  - REST Api

- **Testing**:
  - Unit tests

## 🚀 Installation

To get started with QuizApp, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Varenytsia-Victoria/quiz-app.git
   cd quiz-app
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   ng serve
   ```
   The application will be available at [http://localhost:4200](http://localhost:4200).

## ✨ Running Prettier

To format your code with Prettier, use the following command:
```bash
npm run prettier
```

## 🧪 Running Tests

To run the unit tests, execute:
```bash
npm test
```
