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

  // Chromium 기반 브라우저에서는 CPU 아키텍처(Apple Silicon / Intel, Windows x64 / ARM64)까지 감지해
  // 해당 빌드가 있을 경우 주력 다운로드 버튼과 권장 표시를 자동으로 맞춘다.
  // (Safari·Firefox는 개인정보 보호상 MacIntel 등으로 고정되어 OS 단위로만 기본 추천이 적용된다.)
  const root = document.documentElement;
  const os = root.dataset.downloadOs;
  if ((os === 'mac' || os === 'windows') && navigator.userAgentData?.getHighEntropyValues) {
    navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness'])
      .then((info) => {
        const arch = String(info?.architecture || '').toLowerCase();
        const bitness = String(info?.bitness || '');
        let detected = '';
        if ((arch === 'arm' || arch === 'arm64') && (!bitness || bitness === '64')) detected = 'arm64';
        else if ((arch === 'x86' || arch === 'x86_64') && bitness === '64') detected = 'x64';
        if (!detected) return;

        root.dataset.downloadArch = detected;
        const picker = document.querySelector(`[data-arch-picker="${os}"]`);
        const item = picker?.querySelector(`[data-arch-menu] a[data-arch="${detected}"]`);
        const main = picker?.querySelector('.os-split-main, .download-button');
        if (!picker || !item || !main) return;

        main.href = item.href;
        if (item.dataset.archAria) main.setAttribute('aria-label', item.dataset.archAria);
        const sub = main.querySelector('small');
        if (sub && item.dataset.archLabel) sub.textContent = item.dataset.archLabel;
      })
      .catch(() => {});
  }
})();
