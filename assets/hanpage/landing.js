// Keep the verified release links usable even if GitHub's API is unavailable.
async function refreshDesktopRelease() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch('https://api.github.com/repos/paldyn/HanPage/releases/latest', {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return;
    const release = await response.json();
    if (release.draft || release.prerelease || !Array.isArray(release.assets)) return;
    const downloadPrefix = 'https://github.com/paldyn/HanPage/releases/download/';
    const mac = release.assets.find(asset => /^HanPage_[\d.]+_aarch64\.dmg$/.test(asset.name));
    const windows = release.assets.find(asset => /^HanPage_[\d.]+_x64-setup\.exe$/.test(asset.name));
    const version = /^hanpage-desktop-v(\d+\.\d+\.\d+)$/.exec(release.tag_name);
    if (!mac?.browser_download_url?.startsWith(downloadPrefix) ||
        !windows?.browser_download_url?.startsWith(downloadPrefix) ||
        !release.html_url?.startsWith('https://github.com/paldyn/HanPage/releases/tag/') || !version) return;
    document.querySelectorAll('[data-download="mac"]').forEach(link => {
      link.href = mac.browser_download_url;
    });
    document.querySelectorAll('[data-download="windows"]').forEach(link => {
      link.href = windows.browser_download_url;
    });
    document.querySelector('[data-release-version]').textContent = `v${version[1]}`;
    document.querySelector('[data-release-link]').href = release.html_url;
  } catch {
    // The static links remain available, including when scripts or API access are blocked.
  } finally {
    clearTimeout(timeout);
  }
}

refreshDesktopRelease();
