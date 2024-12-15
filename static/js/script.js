// DOM 요소 선택
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const BASE_URL = "http://localhost:8080"; // 배포된 백엔드 URL


// 상태 변수
let currentQuizId = null; // 현재 진행 중인 퀴즈 ID
let expectingKeyword = true; // 키워드 입력 대기 상태
let expectingQuizConsent = false; // 퀴즈 진행 여부 대기 상태
let expectingAnswer = false; // 정답 입력 대기 상태

// 메시지 추가 함수
function appendMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.innerHTML = message; // HTML 콘텐츠 허용 (URL 포함)

  messageDiv.appendChild(messageContent);
  chatWindow.appendChild(messageDiv);

  scrollToBottom();

}

// 자동 스크롤 함수
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 초기 상태로 리셋
function resetState() {
  currentQuizId = null;
  expectingKeyword = true;
  expectingQuizConsent = false;
  expectingAnswer = false;
}

// 초기 메시지 출력
function displayInitialMessage() {
  appendMessage("bot", "안녕하세요, Fin-Edu입니다. 금융 뉴스와 관련된 정보를 제공합니다.");
  appendMessage("bot", "키워드를 입력해 관련 뉴스를 검색해보세요!");
}

// 초기 메시지 상태로 복원
function resetToInitialMessage() {
  resetState();
  displayInitialMessage();
}


// 오늘 날짜 구하기
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 뉴스 요약 요청
async function fetchNewsSummary(keyword) {
  const today = getTodayDate(); // 오늘 날짜
  try {
    const response = await fetch(`${BASE_URL}/news/summary?date=${today}&keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      appendMessage("bot", "해당 키워드의 뉴스를 찾을 수 없습니다. 다시 입력해주세요.");
      resetToKeywordInput();
      return;
    }

    const data = await response.json();
    appendMessage("bot", `키워드 [${keyword}]에 대한 뉴스:`);
    appendMessage("bot", `제목: ${data.summary_title}`);
    appendMessage("bot", `내용: ${data.summary_content}`);
    appendMessage("bot", "이 뉴스 요약에 대한 퀴즈를 푸시겠습니까? (예/아니오)");

    currentQuizId = data.summaryId; // 뉴스 요약 ID 저장
    expectingKeyword = false;
    expectingQuizConsent = true;
  } catch (error){
    appendMessage("bot", "서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    resetToInitialMessage();
  }
}

// 키워드 입력 상태로 복원
function resetToKeywordInput() {
  resetState();
  appendMessage("bot", "키워드를 입력해주세요.");
}


// 퀴즈 요청 함수
async function fetchQuiz(newsId) {
  try {
      const response = await fetch(`${BASE_URL}/quiz/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ news_id: newsId }),
      });

      // API 응답 확인
      if (!response.ok) {
        appendMessage("bot", "퀴즈 데이터를 불러오지 못했습니다. 다시 시도해주세요.");
        resetToInitialMessage(); // 초기 메시지로 돌아가기
        return;
      }

      const data = await response.json();
      appendMessage("bot", `퀴즈 질문: ${data.quiz.question}`);
      appendMessage(
        "bot",
        `선택지:\n${data.quiz.options
          .map((option, index) => `${index + 1}. ${option}`)
          .join("\n")}`
      );
      appendMessage("bot", "정답 번호를 입력해주세요.");

      currentQuizId = data.quiz.quiz_id;
      expectingQuizConsent = false;
      expectingAnswer = true;
    } catch (error) {
    // 네트워크 또는 서버 오류 처리
    appendMessage("bot", "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    resetToInitialMessage();
  }
}

// 퀴즈 정답 제출 함수
async function submitQuizAnswer(quizId, userAnswer) {
  try {
    const response = await fetch(`${BASE_URL}/quiz/${quizId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAnswer }),
    });

    if (!response.ok) {
      appendMessage("bot", "퀴즈 결과를 처리할 수 없습니다. 다시 시도해주세요.");
      resetToInitialMessage();
      return;
    }

    const data = await response.json();

    // 정답 여부 확인 및 해설 제공
    if (data.data.is_correct) {
      appendMessage("bot", "정답입니다! 🎉");
    } else {
      appendMessage("bot", "오답입니다. 😢");
    }

    appendMessage("bot", `해설: ${data.data.explanation}`);

    resetToInitialMessage();
  } catch (error) {
    appendMessage("bot", "서버 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    resetToInitialMessage()
  }
}


// 사용자 메시지 처리 함수
async function handleUserMessage(userMessage) {
  appendMessage("user", userMessage);

  if (expectingKeyword) {
      await fetchNewsSummary(userMessage);
  } else if (expectingQuizConsent) {
    // 퀴즈 진행 여부 대기 상태
    if (userMessage.toLowerCase() === "예") {
        await fetchQuiz(currentQuizId);
    } else if (userMessage.toLowerCase() === "아니오") {
      resetToInitialMessage();
    } else {
        appendMessage("bot", "'예' 또는 '아니오'로 응답해주세요.");
    }
  } else if (expectingAnswer) {
    // 정답 입력 상태
    const userAnswer = parseInt(userMessage, 10);
    if (!isNaN(userAnswer)) {
        await submitQuizAnswer(currentQuizId, userAnswer);
    } else {
        appendMessage("bot", "유효한 정답 번호를 입력해주세요.");
    }
  } else {
    resetToInitialMessage();
}

}

// 버튼 클릭 이벤트
sendButton.addEventListener("click", () => {
  const userMessage = userInput.value.trim();
  if (userMessage) {
      handleUserMessage(userMessage);
      userInput.value = "";
  }
});

// 엔터키로도 메시지 전송
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendButton.click();
    }
});

// 초기 메시지 출력
document.addEventListener("DOMContentLoaded", () => {
  displayInitialMessage();
});


