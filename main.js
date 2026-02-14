// 게임 상태 관리
let computerNum = 0;
let playButton = document.getElementById("play-button");
let userInput = document.getElementById("user-input");
let resetButton = document.getElementById("reset-button");
let resultDiv = document.getElementById("result");
let chancesDiv = document.getElementById("chances");
let rulesButton = document.getElementById("rules-button");
let rulesModal = document.getElementById("rules-modal");
let nextLevelModal = document.getElementById("next-level-modal");
let closeBtn = document.querySelector(".close");
let scoreDiv = document.getElementById("score");
let rangeDiv = document.getElementById("range");
let guessedNumbersDiv = document.getElementById("guessed-numbers");
let playerNameInput = document.getElementById("player-name");
let rankingList = document.getElementById("ranking-list");
let nextYesBtn = document.getElementById("next-yes-btn");
let nextNoBtn = document.getElementById("next-no-btn");
let currentLevelDisplay = document.getElementById("current-level");

let chances = 3;
let maxChances = 3;
let guessedNumbers = [];
let gameOver = false;
let currentStage = 1; // 1: 쉬움(100), 2: 보통(1000), 3: 어려움(10000)
let difficulty = 100; // 기본 난이도
let score = 0;
let minRange = 1;
let maxRange = 100;
let playerName = "";

// 로컬 스토리지 키
const RANKING_KEY = "numberGameRanking";

const LEVELS = [
    { stage: 1, name: "1단계 (쉬움)", range: 100, difficulty: 100 },
    { stage: 2, name: "2단계 (보통)", range: 1000, difficulty: 1000 },
    { stage: 3, name: "3단계 (어려움)", range: 10000, difficulty: 10000 }
];

// 이벤트 리스너
playButton.addEventListener("click", play);
resetButton.addEventListener("click", reset);
rulesButton.addEventListener("click", openRules);
closeBtn.addEventListener("click", closeRules);
nextYesBtn.addEventListener("click", continueNextLevel);
nextNoBtn.addEventListener("click", endGame);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") play();
});

function getLevelInfo(stage) {
    return LEVELS[stage - 1];
}

function updateLevelDisplay() {
    const level = getLevelInfo(currentStage);
    currentLevelDisplay.textContent = level.name;
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
        showMessage(`🎉 정답입니다! 보너스 점수 +${bonusScore}! 🎉`, "success");
        gameOver = true;
        playButton.disabled = true;
        userInput.disabled = true;
        playerNameInput.disabled = true;
        saveScore();
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
        playerNameInput.disabled = true;
        saveScore();
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
    resultDiv.style.display = "block";
}

function saveScore() {
    playerName = playerNameInput.value.trim() || "익명의 참가자";
    
    // 로컬 스토리지에서 랭킹 가져오기
    let rankings = JSON.parse(localStorage.getItem(RANKING_KEY)) || [];
    
    // 현재 점수 추가
    rankings.push({
        name: playerName,
        score: score,
        level: currentStage,
        date: new Date().toLocaleDateString()
    });
    
    // 점수 기준정렬 (내림차순)
    rankings.sort((a, b) => b.score - a.score);
    
    // 상위 50개만 유지
    rankings = rankings.slice(0, 50);
    
    // 로컬 스토리지에 저장
    localStorage.setItem(RANKING_KEY, JSON.stringify(rankings));
    
    // 현재 순위 표시
    const myRank = rankings.findIndex(r => r.name === playerName && r.score === score) + 1;
    const totalParticipants = rankings.length;
    
    // 랭킹 표시 업데이트
    displayRanking();
    
    // 성공한 경우 다음 레벨 모달 표시
    if (gameOver && userInput.disabled) {
        setTimeout(() => {
            showNextLevelModal(myRank, totalParticipants);
        }, 500);
    }
}

function displayRanking() {
    const rankings = JSON.parse(localStorage.getItem(RANKING_KEY)) || [];
    rankingList.innerHTML = "";
    
    if (rankings.length === 0) {
        rankingList.innerHTML = "<li>아직 기록이 없습니다</li>";
        return;
    }
    
    // 상위 5개만 표시
    rankings.slice(0, 5).forEach((rank, index) => {
        const li = document.createElement("li");
        const medal = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][index];
        const levelName = LEVELS[rank.level - 1].name;
        li.textContent = `${medal} ${rank.name} - ${rank.score}점 (${levelName})`;
        rankingList.appendChild(li);
    });
}

function showNextLevelModal(myRank, totalParticipants) {
    const level = getLevelInfo(currentStage);
    let message = document.getElementById("congrats-message");
    
    if (currentStage === 3) {
        message.innerHTML = `<p>최고 난이도를 모두 클리어했습니다!</p><p>최종 점수: ${score}점</p><p>전체 참가자 중 <strong>${myRank}위</strong>입니다!</p>`;
        nextYesBtn.style.display = "none";
        nextNoBtn.textContent = "종료";
    } else {
        const nextLevel = getLevelInfo(currentStage + 1);
        message.innerHTML = `<p>현재 ${level.name} 클리어!</p><p>최종 점수: ${score}점</p><p>전체 참가자 중 <strong>${myRank}위</strong>입니다!</p><p><strong>${nextLevel.name}</strong>으로 도전해보세요!</p>`;
        nextYesBtn.style.display = "inline-block";
        nextNoBtn.textContent = "종료";
    }
    
    nextLevelModal.classList.remove("hidden");
    nextLevelModal.style.display = "block";
}

function continueNextLevel() {
    nextLevelModal.classList.add("hidden");
    nextLevelModal.style.display = "none";
    
    if (currentStage < 3) {
        currentStage++;
        const level = getLevelInfo(currentStage);
        difficulty = level.difficulty;
        minRange = 1;
        maxRange = level.range;
        updateLevelDisplay();
        reset();
    }
}

function endGame() {
    nextLevelModal.classList.add("hidden");
    nextLevelModal.style.display = "none";
    currentStage = 1;
    reset();
}

function reset() {
    computerNum = 0;
    chances = maxChances;
    guessedNumbers = [];
    gameOver = false;
    userInput.value = "";
    resultDiv.textContent = "";
    resultDiv.className = "result";
    resultDiv.style.display = "none";
    chancesDiv.textContent = `기회: ${maxChances}번`;
    rangeDiv.textContent = `범위: ${minRange} ~ ${maxRange}`;
    playButton.disabled = false;
    userInput.disabled = false;
    playerNameInput.disabled = false;
    guessedNumbersDiv.innerHTML = "";
    score = 0;
    scoreDiv.textContent = "점수: 0";
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
    if (event.target === nextLevelModal) {
        endGame();
    }
});

// 게임 초기화 및 랭킹 표시
resultDiv.style.display = "none";
updateLevelDisplay();
pickRandomNum();
displayRanking();
