// Unified icon updater for action buttons (copy, download, etc.)
export function updateActionButtonState(btn, state = 'idle', action = 'generic', duration = 1000) {
  if (!btn) return;

  // Cache original icon once
  if (!btn.dataset.originalIcon) {
    btn.dataset.originalIcon = btn.innerHTML;
  }

  const ICONS = {
    check: `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-check">
        <path d="M20 6 9 17l-5-5"></path>
      </svg>
    `,
    checkLine: `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-check-line">
        <path d="M20 6 9 17l-5-5"></path>
        <path d="M4 20h16"></path>
      </svg>
    `,
    x: `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-x">
        <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
      </svg>
    `,
    loading: `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-loader-2" style="animation: spin 1s linear infinite;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
    `
  };

  // Choose temp icon per action/state
  let tempIcon = null;
  if (state === 'success') {
    tempIcon = (action === 'download') ? ICONS.checkLine : ICONS.check; // copy => check, download => check-line
  } else if (state === 'downloaded') {
    tempIcon = ICONS.checkLine;
  } else if (state === 'error') {
    tempIcon = ICONS.x;
  } else if (state === 'loading') {
    tempIcon = ICONS.loading;
  }

  if (state === 'idle' || !tempIcon) {
    btn.innerHTML = btn.dataset.originalIcon;
    btn.classList.remove('success-feedback');
    return;
  }

  btn.innerHTML = tempIcon;
  btn.classList.add('success-feedback');

  // auto-restore
  clearTimeout(btn._iconTimer);
  btn._iconTimer = setTimeout(() => {
    btn.innerHTML = btn.dataset.originalIcon;
    btn.classList.remove('success-feedback');
  }, duration);
}
