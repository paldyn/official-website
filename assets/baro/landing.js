(() => {
  const search = document.querySelector('#bookmark-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const bookmarks = [...document.querySelectorAll('.bookmark[data-category]')];
  const grid = document.querySelector('#bookmark-grid');
  const result = document.querySelector('#demo-result');
  const empty = document.querySelector('.demo-empty');
  if (!search || !grid || !result || !empty || !bookmarks.length) return;

  let category = 'all';
  const update = () => {
    const term = search.value.trim().toLocaleLowerCase('ko-KR');
    let count = 0;
    bookmarks.forEach((bookmark) => {
      const matchesCategory = category === 'all' || bookmark.dataset.category === category;
      const matchesTerm = !term || bookmark.dataset.search.toLocaleLowerCase('ko-KR').includes(term);
      bookmark.hidden = !(matchesCategory && matchesTerm);
      if (!bookmark.hidden) count += 1;
    });
    grid.hidden = count === 0;
    empty.hidden = count > 0;
    result.textContent = `${count}개의 예시 링크`;
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.filter;
      filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
      update();
    });
  });
  search.addEventListener('input', update);
})();
