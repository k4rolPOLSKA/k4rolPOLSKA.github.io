const Storage = {
  init() {
    if (localStorage.getItem('balance') === null) {
      localStorage.setItem('balance', '1000');
      localStorage.setItem('wins', '0');
      localStorage.setItem('theme', 'dark');
    }
    this.applyTheme(this.getTheme());
    this.injectTopUpUI();
    this.updateUI();
  },

  getBalance() {
    return parseFloat(localStorage.getItem('balance')) || 0;
  },

  addBalance(amount) {
    const current = this.getBalance();
    const updated = current + amount;
    localStorage.setItem('balance', updated.toFixed(2));
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

    if (balanceEl) balanceEl.textContent = `${this.getBalance().toLocaleString('pl-PL')} PLN`;
    if (winsEl) winsEl.textContent = this.getWins();
    if (themeSelect) themeSelect.value = this.getTheme();
  },

  // Dynamiczne wstrzykiwanie przycisku i modala doładowania
  injectTopUpUI() {
    const dashboardBar = document.querySelector('.dashboard-bar');
    if (!dashboardBar) return;

    // Przycisk w nagłówku
    if (!document.getElementById('topup-btn')) {
      const topUpBtn = document.createElement('button');
      topUpBtn.id = 'topup-btn';
      topUpBtn.className = 'btn-topup';
      topUpBtn.textContent = '+ Doładuj';
      topUpBtn.onclick = () => this.openTopUpModal();
      dashboardBar.insertBefore(topUpBtn, dashboardBar.children[1] || null);
    }

    // Modal okna doładowania
    if (!document.getElementById('topup-modal')) {
      const modalHTML = `
        <div id="topup-modal" class="modal-overlay">
          <div class="modal-card">
            <h3 style="color: var(--text-primary);">Zasil konto symulatora</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.4rem;">Wybierz kwotę doładowania lub wpisz własną:</p>
            
            <div class="topup-presets">
              <button class="btn-preset" onclick="Storage.addBalance(100); Storage.closeTopUpModal();">+100 PLN</button>
              <button class="btn-preset" onclick="Storage.addBalance(500); Storage.closeTopUpModal();">+500 PLN</button>
              <button class="btn-preset" onclick="Storage.addBalance(1000); Storage.closeTopUpModal();">+1000 PLN</button>
            </div>

            <input type="number" id="custom-topup-amount" class="topup-custom-input" placeholder="Inna kwota (PLN)" min="1" step="1">

            <div class="modal-actions">
              <button class="btn-modal-close" onclick="Storage.closeTopUpModal()">Anuluj</button>
              <button class="btn" style="flex: 1; margin: 0;" onclick="Storage.handleCustomTopUp()">Doładuj</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  },

  openTopUpModal() {
    const modal = document.getElementById('topup-modal');
    if (modal) modal.classList.add('active');
  },

  closeTopUpModal() {
    const modal = document.getElementById('topup-modal');
    if (modal) modal.classList.remove('active');
    const input = document.getElementById('custom-topup-amount');
    if (input) input.value = '';
  },

  handleCustomTopUp() {
    const input = document.getElementById('custom-topup-amount');
    const amount = parseFloat(input.value);

    if (!isNaN(amount) && amount > 0) {
      this.addBalance(amount);
      this.closeTopUpModal();
    } else {
      alert('Wpisz poprawną kwotę doładowania.');
    }
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
