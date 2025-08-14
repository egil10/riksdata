// theme.js - Theme toggle and persistence for Riksdata

(function() {
  const KEY = 'riksdata-theme';
  const stored = localStorage.getItem(KEY);
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const initial = stored || 'light'; // Respect stored choice; light is default
  
  // Set initial theme
  document.documentElement.setAttribute('data-theme', initial);
  
  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    
    const applyIcons = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const sunIcon = btn?.querySelector('.sun-icon');
      const moonIcon = btn?.querySelector('.moon-icon');
      
      if (sunIcon) sunIcon.style.display = dark ? 'none' : 'block';
      if (moonIcon) moonIcon.style.display = dark ? 'block' : 'none';
    };
    
    applyIcons();
    
    btn?.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
      applyIcons();
      
      // Broadcast so charts can react
      window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { theme: next }
      }));
    });
  });
})();
