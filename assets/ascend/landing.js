const questions = document.querySelectorAll('.dr-questions details');
questions.forEach(question => {
  question.addEventListener('toggle', () => {
    if (!question.open) return;
    questions.forEach(other => {
      if (other !== question) other.open = false;
    });
  });
});
