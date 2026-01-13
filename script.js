const allTriplets = [
    { a: "מגדל", b: "פיקוח", c: "נפש" },
    { a: "תות", b: "שדה", c: "קרב" },
    { a: "תיבת", b: "דואר", c: "אלקטרוני" },
    { a: "נציב", b: "מלח", c: "גס" },
    { a: "סוס", b: "ים", c: "המלח" },
    { a: "חד", b: "קרן", c: "שמש" },
    { a: "דמי", b: "כיס", c: "אוויר" },
    { a: "משחק", b: "מילים", c: "נרדפות" },
    { a: "שומר", b: "מסך", c: "עשן" },
    // New additions
    { a: "דג", b: "זהב", c: "טהור" },
    { a: "מצב", b: "רוח", c: "פרצים" },
    { a: "מורה", b: "דרך", c: "המלך" },
    { a: "שנות", b: "אור", c: "ראשון" },
    { a: "תפוח", b: "עץ", c: "השדה" },
    { a: "תמונת", b: "מצב", c: "חירום" },
    { a: "אסיר", b: "תודה", c: "רבה" },
    { a: "שואב", b: "אבק", c: "שרפה" },
    { a: "קר", b: "מזג", c: "אוויר" },
    { a: "מוצאי", b: "שבת", c: "שלום" },
    { a: "נווה", b: "מדבר", c: "יהודה" },
    // Batch 2
    { a: "סינדרום", b: "ירושלים", c: "הבנויה" },
    { a: "קריית", b: "ארבע", c: "אימהות" },
    { a: "רודף", b: "בצע", c: "כסף" },
    { a: "כרטיס", b: "ביקור", c: "חולים" },
    { a: "כרטיס", b: "מועדון", c: "סגור" },
    { a: "בית", b: "קפה", c: "נמס" },
    { a: "בית", b: "ספר", c: "הספרים" },
    { a: "מאה", b: "אחוז", c: "החסימה" },
    { a: "צמח", b: "בר", c: "מצווה" },
    { a: "בית", b: "כנסת", c: "הגדולה" },
    { a: "אבקת", b: "מרק", c: "עוף" }
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
const welcomeModal = document.getElementById('welcome-modal');
const modalClue = document.getElementById('modal-clue');
const answerInput = document.getElementById('answer-input');
const errorMessage = document.getElementById('error-message');
const submitBtn = document.getElementById('submit-btn');
const hintBtn = document.getElementById('hint-btn');
const hintText = document.getElementById('hint-text');
const positionHintBtn = document.getElementById('position-hint-btn');
const positionHintText = document.getElementById('position-hint-text');
const closeModal = document.querySelector('.close-modal');
const timerDisplay = document.getElementById('timer');
const finalTimeDisplay = document.getElementById('final-time');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');

function initGame() {
    // Reset state
    gameState = [];
    solvedCount = 0;
    stopTimer();
    timerDisplay.textContent = "00:00";
    grid.innerHTML = '';
    winModal.classList.add('hidden');

    // Shuffle and pick 9
    const shuffled = [...allTriplets].sort(() => 0.5 - Math.random());
    const selectedTriplets = shuffled.slice(0, 9);

    // We'll map the triplets to game state objects
    gameState = selectedTriplets.map((triplet, index) => {
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
    // Do NOT start timer here. Timer starts when welcome modal closes.
}

function startGame() {
    welcomeModal.classList.add('hidden');
    startTimer();
}

function renderGrid() {
    // ... existing renderGrid logic ...
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
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';

    // Reset hints
    hintText.classList.add('hidden');
    hintText.textContent = '';
    positionHintText.classList.add('hidden');
    positionHintText.textContent = '';

    // Check if 2 minutes passed for position hint
    updatePositionHintState();

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
        errorMessage.textContent = 'לא נכון, נסה שנית';
        errorMessage.classList.remove('hidden');
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

function getPositionHint() {
    if (currentCellIndex === null) return;
    const item = gameState[currentCellIndex];
    // item.show is what is SHOWN. 
    // If shown is 'a' (1st), target is 'c' (3rd).
    // If shown is 'c' (3rd), target is 'a' (1st).

    let message = "";
    if (item.show === 'a') {
        // Shown word is A (First)
        message = "המילה שלכם היא המילה הראשונה בצירוף";
    } else {
        // Shown word is C (Last/Second in the B-C pair logic)
        message = "המילה שלכם היא המילה השנייה בצירוף";
    }

    positionHintText.textContent = message;
    positionHintText.classList.remove('hidden');
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

    // Update hint button state live if modal is open
    if (!inputModal.classList.contains('hidden')) {
        updatePositionHintState();
    }
}

function updatePositionHintState() {
    if (!startTime) return;
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const timeLeft = 120 - timeElapsed;

    if (timeLeft <= 0) {
        positionHintBtn.disabled = false;
        positionHintBtn.textContent = "רמז נוסף: מיקום המילה";
        positionHintBtn.classList.remove('locked');
    } else {
        positionHintBtn.disabled = true;
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        positionHintBtn.textContent = `רמז נוסף ייפתח בעוד ${m}:${s.toString().padStart(2, '0')}`;
        positionHintBtn.classList.add('locked');
    }
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
answerInput.addEventListener('input', () => {
    errorMessage.classList.add('hidden');
});

hintBtn.onclick = getHint;
positionHintBtn.onclick = getPositionHint;

restartBtn.onclick = () => {
    // Reload to show welcome again or just init? 
    // Usually restart just restarts game, but let's init
    initGame();
    // For restart, maybe skip welcome? or show again? 
    // Let's just initGame and startTimer immediately for restart, 
    // OR we can make it so restart goes back to grid.
    startTimer();
};
startBtn.onclick = startGame;

// Start game on load
initGame();

