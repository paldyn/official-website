(() => {
  const pickers = [...document.querySelectorAll('[data-arch-picker]')];
  if (!pickers.length) return;

  function setMenuOpen(picker, open) {
    const toggle = picker.querySelector('[data-arch-toggle]');
    const menu = picker.querySelector('[data-arch-menu]');
    if (!toggle || !menu) return;
    picker.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  }

  function closeAll(exceptPicker) {
    pickers.forEach((picker) => {
      if (picker !== exceptPicker) setMenuOpen(picker, false);
    });
  }

  pickers.forEach((picker) => {
    const toggle = picker.querySelector('[data-arch-toggle]');
    const menu = picker.querySelector('[data-arch-menu]');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = menu.hidden;
      closeAll(picker);
      setMenuOpen(picker, willOpen);
    });

    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (link) closeAll(null);
      else event.stopPropagation();
    });
  });

  document.querySelectorAll('[data-arch-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const targetPicker = document.querySelector(`[data-arch-picker="${trigger.dataset.archOpen}"]`);
      if (!targetPicker) return;
      closeAll(targetPicker);
      setMenuOpen(targetPicker, true);
      const firstItem = targetPicker.querySelector('[data-arch-menu] a[href]');
      if (firstItem) firstItem.focus();
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-arch-picker]')) closeAll(null);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openPicker = pickers.find((picker) => picker.classList.contains('is-open'));
    if (!openPicker) return;
    closeAll(null);
    const toggle = openPicker.querySelector('[data-arch-toggle]');
    if (toggle) toggle.focus();
  });
})();
