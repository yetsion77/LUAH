const wordTriplets = [
    { a: "מגדל", b: "פיקוח", c: "נפש" },
    { a: "תות", b: "שדה", c: "קרב" },
    { a: "תיבת", b: "דואר", c: "אלקטרוני" },
    { a: "נציב", b: "מלח", c: "גס" },
    { a: "סוס", b: "ים", c: "המלח" },
    { a: "חד", b: "קרן", c: "שמש" },
    { a: "דמי", b: "כיס", c: "אוויר" },
    { a: "משחק", b: "מילים", c: "נרדפות" },
    { a: "שומר", b: "מסך", c: "עשן" }
];

let gameState = [];
let startTime = null;
let timerInterval = null;
let currentCellIndex = null;
let solvedCount = 0;

// DOM Elements
const grid = document.getElementById('game-grid');
const inputModal = document.getElementById('input-modal');
const winModal = document.getElementById('win-modal');
const modalClue = document.getElementById('modal-clue');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const hintBtn = document.getElementById('hint-btn');
const hintText = document.getElementById('hint-text');
const closeModal = document.querySelector('.close-modal');
const timerDisplay = document.getElementById('timer');
const finalTimeDisplay = document.getElementById('final-time');
const restartBtn = document.getElementById('restart-btn');

function initGame() {
    // Reset state
    gameState = [];
    solvedCount = 0;
    stopTimer();
    timerDisplay.textContent = "00:00";
    grid.innerHTML = '';
    winModal.classList.add('hidden');
    
    // Shuffle logic if we had more words, but for now we use the 9 provided.
    // However, we need to decide for each one if we show 'a' or 'c'.
    
    // We'll map the triplets to game state objects
    gameState = wordTriplets.map((triplet, index) => {
        // Randomly choose hidden side: 0 for show A (hide C), 1 for show C (hide A)
        // Adjusting logic: 
        // User receives a word (A or C). Needs to guess the other one (C or A).
        // Linking word B is always hidden but is the key.
        const showSide = Math.random() < 0.5 ? 'a' : 'c'; 
        return {
            ...triplet,
            id: index,
            show: showSide, // 'a' or 'c' is what users SEE
            solved: false
        };
    });

    renderGrid();
    startTimer();
}

function renderGrid() {
    grid.innerHTML = '';
    gameState.forEach((item, index) => {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        if (item.solved) {
            cell.classList.add('solved');
            cell.innerHTML = `
                <div class="clue">${item.a} - ${item.b} - ${item.c}</div>
                <div class="solved-detail">✓</div>
            `;
        } else {
            const shownWord = item[item.show];
            cell.textContent = shownWord;
            cell.dataset.index = index;
            cell.onclick = () => openModal(index);
        }
        grid.appendChild(cell);
    });
}

function openModal(index) {
    if (gameState[index].solved) return;
    
    currentCellIndex = index;
    const item = gameState[index];
    const shownWord = item[item.show];
    
    modalClue.textContent = `המילה: ${shownWord}`;
    answerInput.value = '';
    hintText.classList.add('hidden');
    hintText.textContent = '';
    inputModal.classList.remove('hidden');
    
    // Focus input after a short delay for mobile keyboard
    setTimeout(() => answerInput.focus(), 100);
}

function closeInputModal() {
    inputModal.classList.add('hidden');
    currentCellIndex = null;
}

function checkAnswer() {
    if (currentCellIndex === null) return;
    
    const input = answerInput.value.trim();
    if (!input) return;
    
    const item = gameState[currentCellIndex];
    // The target word they need to guess is the one NOT shown.
    // If show 'a', target is 'c'. If show 'c', target is 'a'.
    const targetWord = item.show === 'a' ? item.c : item.a;
    
    if (input === targetWord) {
        // Correct
        item.solved = true;
        solvedCount++;
        closeInputModal();
        renderGrid();
        
        if (solvedCount === gameState.length) {
            handleWin();
        }
    } else {
        // Incorrect
        shakeModal();
    }
}

function getHint() {
    if (currentCellIndex === null) return;
    const item = gameState[currentCellIndex];
    // Hint is the first letter of the linking word (b)
    const hint = item.b.charAt(0);
    hintText.textContent = `האות הראשונה של המילה המקשרת: ${hint}`;
    hintText.classList.remove('hidden');
}

function shakeModal() {
    const content = document.querySelector('.modal-content');
    content.classList.add('shake');
    setTimeout(() => content.classList.remove('shake'), 500);
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    const now = Date.now();
    const diff = Math.floor((now - startTime) / 1000);
    const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
    const seconds = (diff % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function handleWin() {
    stopTimer();
    finalTimeDisplay.textContent = timerDisplay.textContent;
    setTimeout(() => {
        winModal.classList.remove('hidden');
    }, 500);
}

// Event Listeners
closeModal.onclick = closeInputModal;
window.onclick = (event) => {
    if (event.target == inputModal) closeInputModal();
};

submitBtn.onclick = checkAnswer;
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

hintBtn.onclick = getHint;
restartBtn.onclick = initGame;

// Start game on load
initGame();
