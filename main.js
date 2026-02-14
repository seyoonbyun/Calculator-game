// 게임 상태 관리
let computerNum = 0;
let playButton = document.getElementById("play-button");
let userInput = document.getElementById("user-input");
let resetButton = document.getElementById("reset-button");
let resultDiv = document.getElementById("result");
let chancesDiv = document.getElementById("chances");
let rulesButton = document.getElementById("rules-button");
let rulesModal = document.getElementById("rules-modal");
let closeBtn = document.querySelector(".close");
let scoreDiv = document.getElementById("score");
let rangeDiv = document.getElementById("range");
let guessedNumbersDiv = document.getElementById("guessed-numbers");

let chances = 3;
let maxChances = 3;
let guessedNumbers = [];
let gameOver = false;
let difficulty = 100; // 기본 난이도
let score = 0;
let minRange = 1;
let maxRange = 100;

// 난이도 버튼
const easyBtn = document.getElementById("easy-btn");
const normalBtn = document.getElementById("normal-btn");
const hardBtn = document.getElementById("hard-btn");

// 이벤트 리스너
playButton.addEventListener("click", play);
resetButton.addEventListener("click", reset);
rulesButton.addEventListener("click", openRules);
closeBtn.addEventListener("click", closeRules);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") play();
});

// 난이도 선택
easyBtn.addEventListener("click", () => setDifficulty(100, easyBtn));
normalBtn.addEventListener("click", () => setDifficulty(1000, normalBtn));
hardBtn.addEventListener("click", () => setDifficulty(10000, hardBtn));

function setDifficulty(range, button) {
    // 게임 중이면 변경 불가
    if (!gameOver || guessedNumbers.length > 0) {
        alert("게임을 먼저 끝내세요.");
        return;
    }
    
    difficulty = range;
    minRange = 1;
    maxRange = range;
    maxChances = 3;
    chances = maxChances;
    
    // 버튼 스타일 업데이트
    document.querySelectorAll(".difficulty-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    
    // 입력창 placeholder 업데이트
    userInput.placeholder = `숫자를 입력하세요 (${minRange}~${maxRange})`;
    rangeDiv.textContent = `범위: ${minRange} ~ ${maxRange}`;
    chancesDiv.textContent = `기회: ${maxChances}번`;
    
    reset();
}

function pickRandomNum() {
    computerNum = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    console.log("정답", computerNum);
}

function play() {
    const userNum = parseInt(userInput.value);
    
    // 입력이 없을 때
    if (isNaN(userNum)) {
        showMessage("숫자를 입력하세요.", "error");
        return;
    }
    
    // 범위 체크
    if (userNum < minRange || userNum > maxRange) {
        showMessage(`${minRange}~${maxRange} 범위 안의 숫자를 입력하세요!`, "error");
        return;
    }
    
    // 이미 입력한 숫자 체크
    if (guessedNumbers.includes(userNum)) {
        showMessage("이미 입력한 숫자입니다! 기회를 쓰지 않습니다.", "error");
        return;
    }
    
    // 게임이 끝났을 때
    if (gameOver) {
        showMessage("게임이 끝났습니다. Reset을 눌러 새 게임을 시작하세요.", "error");
        return;
    }
    
    // 입력한 숫자 기록
    guessedNumbers.push(userNum);
    updateGuessedList();
    chances--;
    chancesDiv.textContent = `기회: ${chances}번`;
    
    // 점수 계산
    const difficultyMultiplier = difficulty === 100 ? 10 : difficulty === 1000 ? 20 : 30;
    score += difficultyMultiplier;
    scoreDiv.textContent = `점수: ${score}`;
    
    // 정답 확인
    if (userNum === computerNum) {
        const bonusScore = (chances + 1) * difficultyMultiplier;
        score += bonusScore;
        scoreDiv.textContent = `점수: ${score}`;
        showMessage(`🎉 정답입니다! 보너스 점수 +${bonusScore}! 아이패드 겟!! 🎉`, "success");
        gameOver = true;
        playButton.disabled = true;
        userInput.disabled = true;
        return;
    }
    
    // 크기 비교
    if (computerNum < userNum) {
        showMessage("⬇️ Down!!!");
    } else if (computerNum > userNum) {
        showMessage("⬆️ Up!!");
    }
    
    // 기회 다 쓰면 게임 끝
    if (chances === 0) {
        showMessage(`❌ 게임 끝! 정답은 ${computerNum}입니다.`, "error");
        gameOver = true;
        playButton.disabled = true;
        userInput.disabled = true;
    }
    
    userInput.value = "";
}

function updateGuessedList() {
    guessedNumbersDiv.innerHTML = guessedNumbers
        .map(num => `<span class="guessed-number">${num}</span>`)
        .join("");
}

function showMessage(message, type = "") {
    resultDiv.textContent = message;
    resultDiv.className = "result";
    if (type) resultDiv.classList.add(type);
}

function reset() {
    computerNum = 0;
    chances = maxChances;
    guessedNumbers = [];
    gameOver = false;
    userInput.value = "";
    resultDiv.textContent = "";
    resultDiv.className = "result";
    chancesDiv.textContent = `기회: ${maxChances}번`;
    rangeDiv.textContent = `범위: ${minRange} ~ ${maxRange}`;
    playButton.disabled = false;
    userInput.disabled = false;
    guessedNumbersDiv.innerHTML = "";
    pickRandomNum();
    userInput.focus();
}

function openRules() {
    rulesModal.classList.remove("hidden");
    rulesModal.style.display = "block";
}

function closeRules() {
    rulesModal.classList.add("hidden");
    rulesModal.style.display = "none";
}

window.addEventListener("click", (event) => {
    if (event.target === rulesModal) {
        closeRules();
    }
});

// 게임 초기화
pickRandomNum();
