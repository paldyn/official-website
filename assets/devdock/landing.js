(() => {
  const input = document.querySelector('#json-example');
  const output = document.querySelector('#json-output');
  const format = document.querySelector('[data-format]');
  const minify = document.querySelector('[data-minify]');
  const reset = document.querySelector('[data-reset]');
  const status = document.querySelector('.demo-status');
  if (!input || !output || !format || !minify || !reset || !status) return;

  const example = input.value;
  const say = (text, error) => {
    status.classList.toggle('is-error', Boolean(error));
    status.textContent = text;
  };
  // 앱과 같은 흐름이다 — 입력은 그대로 두고 결과만 출력 칸에 쌓인다.
  const run = (pretty) => {
    try {
      const parsed = JSON.parse(input.value);
      output.textContent = pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
      output.classList.remove('is-empty');
      say(pretty ? 'JSON 정리를 완료했어요.' : 'JSON 을 한 줄로 압축했어요.');
    } catch {
      say('JSON 형식을 확인해 주세요.', true);
    }
  };
  format.addEventListener('click', () => run(true));
  minify.addEventListener('click', () => run(false));
  reset.addEventListener('click', () => {
    input.value = example;
    output.textContent = '';
    output.classList.add('is-empty');
    input.scrollTop = 0;
    input.scrollLeft = 0;
    say('예제 JSON을 다시 불러왔어요.');
  });
  input.addEventListener('input', () => say('포맷팅을 눌러 확인하세요.'));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      run(true);
    }
  });
  output.classList.add('is-empty');
})();
