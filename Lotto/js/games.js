// Pomocnicza funkcja generująca unikalne losowe liczby
function getRandomNumbers(count, max) {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// Renderowanie kulek na stronie
function renderBalls(numbers, extraNumbers = []) {
  const container = document.getElementById('balls-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  numbers.forEach(num => {
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.textContent = num;
    container.appendChild(ball);
  });

  extraNumbers.forEach(num => {
    const ball = document.createElement('div');
    ball.className = 'ball extra';
    ball.textContent = num;
    container.appendChild(ball);
  });
}

// Glówna funkcja wykonująca grę
function playSingleGame(cost, drawFn, winCheckFn) {
  if (!Storage.subtractBalance(cost)) {
    alert('Brak wystarczających środków na koncie! Zasil portfel.');
    return;
  }

  const result = drawFn();
  renderBalls(result.main, result.extra || []);
  
  const reward = winCheckFn(result);
  const resultPanel = document.getElementById('result-panel');
  if (resultPanel) {
    resultPanel.style.display = 'block';

    if (reward > 0) {
      Storage.addBalance(reward);
      Storage.addWin();
      resultPanel.innerHTML = `
        <h3 style="color: var(--green); font-size: 1.4rem;">
          🎉 GRATULACJE! Wygrana: +${reward.toLocaleString('pl-PL')} PLN!
        </h3>`;
    } else {
      resultPanel.innerHTML = `
        <h3 style="color: var(--text-secondary)">
          Brak wygranej w tym losowaniu. Spróbuj szczęścia ponownie!
        </h3>`;
    }
  }
}

/* ==========================================================================
   LOGIKA POSZCZEGÓLNYCH GIER ZE ZWIĘKSZONYMI WYGRANYMI
   ========================================================================== */

// 1. LOTTO (Koszt: 3 PLN)
function playLotto() {
  playSingleGame(
    3,
    () => ({ main: getRandomNumbers(6, 49) }),
    () => {
      const chance = Math.random();
      if (chance < 0.00000007) return 15000000; // Główna wygrana (Szóstka): 15,000,000 PLN
      if (chance < 0.00002) return 8000;        // Piątka: 8,000 PLN
      if (chance < 0.001) return 300;           // Czwórka: 300 PLN
      if (chance < 0.02) return 24;             // Trójka: 24 PLN
      return 0;
    }
  );
}

// 2. MINI LOTTO (Koszt: 1.50 PLN)
function playMiniLotto() {
  playSingleGame(
    1.50,
    () => ({ main: getRandomNumbers(5, 42) }),
    () => {
      const chance = Math.random();
      if (chance < 0.000001) return 400000;    // Główna wygrana (Piątka): 400,000 PLN
      if (chance < 0.0008) return 1200;        // Czwórka: 1,200 PLN
      if (chance < 0.015) return 42;           // Trójka: 42 PLN
      return 0;
    }
  );
}

// 3. MULTI MULTI (Koszt: 2.50 PLN)
function playMultiMulti() {
  playSingleGame(
    2.50,
    () => ({ main: getRandomNumbers(20, 80) }),
    () => {
      const chance = Math.random();
      if (chance < 0.0000004) return 2500000;  // Trafienie 10 z 10: 2,500,000 PLN
      if (chance < 0.00001) return 100000;     // Trafienie 9 z 10: 100,000 PLN
      if (chance < 0.0003) return 10000;       // Trafienie 8 z 10: 10,000 PLN
      if (chance < 0.005) return 500;          // Trafienie 7 z 10: 500 PLN
      if (chance < 0.04) return 50;            // Trafienie 6 z 10: 50 PLN
      if (chance < 0.1) return 10;             // Trafienie 5 z 10: 10 PLN
      return 0;
    }
  );
}

// 4. EUROJACKPOT (Koszt: 12 PLN)
function playEurojackpot() {
  playSingleGame(
    12,
    () => ({
      main: getRandomNumbers(5, 50),
      extra: getRandomNumbers(2, 12)
    }),
    () => {
      const chance = Math.random();
      if (chance < 0.000000007) return 200000000; // Jackpot I stopnia: 200,000,000 PLN
      if (chance < 0.0000001) return 10000000;    // II stopień (5+1): 10,000,000 PLN
      if (chance < 0.000003) return 500000;       // III stopień (5+0): 500,000 PLN
      if (chance < 0.00006) return 15000;         // IV stopień (4+2): 15,000 PLN
      if (chance < 0.001) return 1000;            // V stopień (4+1): 1,000 PLN
      if (chance < 0.02) return 120;              // Dalszy stopień: 120 PLN
      if (chance < 0.05) return 45;               // Najniższa wygrana: 45 PLN
      return 0;
    }
  );
}

// 5. KENO (Koszt: 2 PLN)
function playKeno() {
  playSingleGame(
    2,
    () => ({ main: getRandomNumbers(10, 70) }),
    () => {
      const chance = Math.random();
      if (chance < 0.0000005) return 200000;   // Trafienie 10 z 10: 200,000 PLN
      if (chance < 0.00002) return 10000;      // Trafienie 9 z 10: 10,000 PLN
      if (chance < 0.0005) return 1500;        // Trafienie 8 z 10: 1,500 PLN
      if (chance < 0.007) return 100;          // Trafienie 7 z 10: 100 PLN
      if (chance < 0.04) return 18;            // Trafienie 6 z 10: 18 PLN
      if (chance < 0.1) return 4;              // Trafienie 5 z 10: 4 PLN
      return 0;
    }
  );
}

// 6. KASKADA (Koszt: 2 PLN)
function playKaskada() {
  playSingleGame(
    2,
    () => ({ main: getRandomNumbers(12, 24) }),
    () => {
      const chance = Math.random();
      if (chance < 0.0000007) return 250000;   // Trafienie 12 z 12: 250,000 PLN
      if (chance < 0.00003) return 1000;       // Trafienie 11 z 12: 1,000 PLN
      if (chance < 0.001) return 25;           // Trafienie 10 z 12: 25 PLN
      if (chance < 0.02) return 8;             // Trafienie 9 z 12: 8 PLN
      if (chance < 0.1) return 2;              // Trafienie 8 z 12: 2 PLN
      return 0;
    }
  );
}
