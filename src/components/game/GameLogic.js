export class GameLogic {
    constructor() {
      this.questions = [
        {
          question: "What is the capital of France?",
          options: ["Paris", "London", "Berlin", "Madrid"],
          answer: "Paris",
        },
        {
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          answer: "4",
        },
        {
          question: "What is the largest planet in the solar system?",
          options: ["Earth", "Mars", "Jupiter", "Saturn"],
          answer: "Jupiter",
        },
      ];
      this.currentQuestionIndex = 0;
    }
  
    getNextQuestion() {
      if (this.currentQuestionIndex >= this.questions.length) {
        return null; 
      }
      const question = this.questions[this.currentQuestionIndex];
      this.currentQuestionIndex++;
      return question;
    }
  
    checkAnswer(question, answer) {
      return question.answer === answer;
    }
  }