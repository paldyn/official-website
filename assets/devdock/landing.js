(() => {
  const input = document.querySelector('#json-example');
  const format = document.querySelector('[data-format]');
  const reset = document.querySelector('[data-reset]');
  const status = document.querySelector('.demo-status');
  const numbers = document.querySelector('.line-numbers');
  if (!input || !format || !reset || !status || !numbers) return;

  const example = input.value;
  const showLineNumbers = () => {
    const lines = input.value.split('\n').length;
    numbers.textContent = Array.from({ length: Math.min(lines, 100) }, (_, index) => index + 1).join('\n');
  };
  const formatJson = () => {
    try {
      input.value = JSON.stringify(JSON.parse(input.value), null, 2);
      input.scrollTop = 0;
      input.scrollLeft = 0;
      showLineNumbers();
      status.classList.remove('is-error');
      status.textContent = 'JSON 정리를 완료했어요.';
    } catch {
      status.classList.add('is-error');
      status.textContent = 'JSON 형식을 확인해 주세요.';
    }
  };
  format.addEventListener('click', formatJson);
  reset.addEventListener('click', () => {
    input.value = example;
    input.scrollTop = 0;
    input.scrollLeft = 0;
    showLineNumbers();
    status.classList.remove('is-error');
    status.textContent = '예제 JSON을 다시 불러왔어요.';
  });
  input.addEventListener('input', () => {
    showLineNumbers();
    status.classList.remove('is-error');
    status.textContent = '포맷 정리를 눌러 확인하세요.';
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formatJson();
    }
  });
  input.addEventListener('scroll', () => {
    numbers.scrollTop = input.scrollTop;
  });
  showLineNumbers();
})();
