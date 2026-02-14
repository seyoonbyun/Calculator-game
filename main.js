//랜덤번호 지정
//유저가 번호를 입력한다 그리고 go 라는 버튼을 누름
//만약에 유저가 랜덤번호를 맞추면, 맞췄습니다!
// 랜덤번호가 < 유저번호 Down!!!
// 랜덤번호가 > 유저번호 Up!!
//Reset버튼을 누르면 게임이 리셋된다
// 5번의 기회를 다쓰면 게임이 끝난다 (더이상 추측 불가, 버튼이 disable)
//1~100 범위 밖에 숫자를 입력하면 알려준다. 기회를 깍지 않는다
// 유저가 이미 입력한 숫자를 또 입력하면, 알려준다, 기회를 깍지 않는다

let computerNum = 0;
let playButton = document.getElementById("play-button");
let userInput = document.getElementById("user-input");
let resetButton = document.getElementById("reset-button");
let resultDiv = document.getElementById("result");
let chancesDiv = document.getElementById("chances");

let chances = 5;
let guessedNumbers = [];
let gameOver = false;

playButton.addEventListener("click", play);
resetButton.addEventListener("click", reset);

function pickRandomNum() {
    computerNum = Math.floor(Math.random() * 100) + 1;
    console.log("정답", computerNum);
}

function play() {
    const userNum = parseInt(userInput.value);
    
    // 입력이 없을 때
    if (isNaN(userNum)) {
        resultDiv.textContent = "숫자를 입력하세요.";
        return;
    }
    
    // 범위 체크 (1~100)
    if (userNum < 1 || userNum > 100) {
        resultDiv.textContent = "1~100 범위 안의 숫자를 입력하세요!";
        return;
    }
    
    // 이미 입력한 숫자 체크
    if (guessedNumbers.includes(userNum)) {
        resultDiv.textContent = "이미 입력한 숫자입니다!";
        return;
    }
    
    // 게임이 끝났을 때
    if (gameOver) {
        resultDiv.textContent = "게임이 끝났습니다.";
        return;
    }
    
    // 입력한 숫자 기록
    guessedNumbers.push(userNum);
    chances--;
    chancesDiv.textContent = `기회: ${chances}번`;
    
    // 정답 확인
    if (userNum === computerNum) {
        resultDiv.textContent = "맞췄습니다!";
        gameOver = true;
        playButton.disabled = true;
        userInput.disabled = true;
        return;
    }
    
    // 크기 비교
    if (computerNum < userNum) {
        resultDiv.textContent = "Down!!!";
    } else if (computerNum > userNum) {
        resultDiv.textContent = "Up!!";
    }
    
    // 기회 다 쓰면 게임 끝
    if (chances === 0) {
        resultDiv.textContent = `게임 끝! 정답은 ${computerNum}입니다.`;
        gameOver = true;
        playButton.disabled = true;
        userInput.disabled = true;
    }
    
    userInput.value = "";
}

function reset() {
    computerNum = 0;
    chances = 5;
    guessedNumbers = [];
    gameOver = false;
    userInput.value = "";
    resultDiv.textContent = "";
    chancesDiv.textContent = "기회: 5번";
    playButton.disabled = false;
    userInput.disabled = false;
    pickRandomNum();
}

pickRandomNum();
