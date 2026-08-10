function getRandomNumbers(count, max) {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

function renderBalls(numbers, extraNumbers = []) {
  const container = document.getElementById('balls-container');
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

function playSingleGame(cost, drawFn, winCheckFn) {
  if (!Storage.subtractBalance(cost)) {
    alert('Brak wystarczających środków na koncie!');
    return;
  }

  const result = drawFn();
  renderBalls(result.main, result.extra || []);
  
  const reward = winCheckFn(result);
  const resultPanel = document.getElementById('result-panel');
  resultPanel.style.display = 'block';

  if (reward > 0) {
    Storage.addBalance(reward);
    Storage.addWin();
    resultPanel.innerHTML = `<h3 style="color: var(--green)">Wygrana: +${reward} PLN!</h3>`;
  } else {
    resultPanel.innerHTML = `<h3 style="color: var(--text-secondary)">Brak wygranej. Spróbuj ponownie!</h3>`;
  }
}

// Przykład konfiguracji pojedynczej gry (Lotto)
function playLotto() {
  playSingleGame(
    3, // Koszt losu: 3 PLN
    () => ({ main: getRandomNumbers(6, 49) }),
    (result) => {
      // Prosta symulacja szans na wygraną
      const chance = Math.random();
      if (chance < 0.02) return 24;     // ~3 trafienia
      if (chance < 0.002) return 200;    // ~4 trafienia
      if (chance < 0.0001) return 5000;  // ~5 trafień
      return 0;
    }
  );
}

function playMiniLotto() {
  playSingleGame(
    1.5,
    () => ({ main: getRandomNumbers(5, 42) }),
    () => (Math.random() < 0.05 ? 20 : 0)
  );
}

function playMultiMulti() {
  playSingleGame(
    2.5,
    () => ({ main: getRandomNumbers(20, 80) }),
    () => (Math.random() < 0.1 ? 10 : 0)
  );
}

function playEurojackpot() {
  playSingleGame(
    12,
    () => ({
      main: getRandomNumbers(5, 50),
      extra: getRandomNumbers(2, 12)
    }),
    () => (Math.random() < 0.03 ? 45 : 0)
  );
}

function playKeno() {
  playSingleGame(
    2,
    () => ({ main: getRandomNumbers(10, 70) }),
    () => (Math.random() < 0.08 ? 8 : 0)
  );
}

function playKaskada() {
  playSingleGame(
    2,
    () => ({ main: getRandomNumbers(12, 24) }),
    () => (Math.random() < 0.06 ? 12 : 0)
  );
}
