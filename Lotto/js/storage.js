const Storage = {
  init() {
    if (localStorage.getItem('balance') === null) {
      localStorage.setItem('balance', '1000');
      localStorage.setItem('wins', '0');
      localStorage.setItem('theme', 'dark');
    }
    this.applyTheme(this.getTheme());
    this.updateUI();
  },

  getBalance() {
    return parseFloat(localStorage.getItem('balance')) || 0;
  },

  addBalance(amount) {
    const current = this.getBalance();
    localStorage.setItem('balance', (current + amount).toFixed(2));
    this.updateUI();
  },

  subtractBalance(amount) {
    const current = this.getBalance();
    if (current >= amount) {
      localStorage.setItem('balance', (current - amount).toFixed(2));
      this.updateUI();
      return true;
    }
    return false;
  },

  getWins() {
    return parseInt(localStorage.getItem('wins')) || 0;
  },

  addWin() {
    const wins = this.getWins() + 1;
    localStorage.setItem('wins', wins.toString());
    this.updateUI();
  },

  getTheme() {
    return localStorage.getItem('theme') || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  },

  updateUI() {
    const balanceEl = document.getElementById('user-balance');
    const winsEl = document.getElementById('user-wins');
    const themeSelect = document.getElementById('theme-select');

    if (balanceEl) balanceEl.textContent = `${this.getBalance()} PLN`;
    if (winsEl) winsEl.textContent = this.getWins();
    if (themeSelect) themeSelect.value = this.getTheme();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      Storage.setTheme(e.target.value);
    });
  }
});
