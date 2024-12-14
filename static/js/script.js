// DOM 요소 선택
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const BASE_URL = "http://your-backend-server.com"; // 배포된 백엔드 URL


// 상태 변수
let currentQuizId = null; // 현재 진행 중인 퀴즈 ID
let expectingKeyword = true; // 키워드 입력 대기 상태
let expectingAnswer = false; // 정답 입력 대기 상태

// 메시지 추가 함수
function appendMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.textContent = message;

  messageDiv.appendChild(messageContent);
  chatWindow.appendChild(messageDiv);

  // 메시지가 추가될 때 자동으로 아래로 스크롤
  scrollToBottom();

}


// 오늘 날짜 구하기
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 뉴스 요약 요청 함수
async function fetchNewsSummary(keyword) {
  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD)
  try {
      const response = await fetch(`${BASE_URL}/news/summary?date=${today}&keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) throw await response.json();

      const data = await response.json();
      if (data.data) {
          appendMessage("bot", `키워드 [${keyword}]에 대한 뉴스:`);
          appendMessage("bot", `제목: ${data.data.summary_title}`);
          appendMessage("bot", `내용: ${data.data.summary_content}`);
          appendMessage("bot", `원본 링크: <a href="${data.data.original_url}" target="_blank">${data.data.original_url}</a>`);
          appendMessage("bot", "이 뉴스로 퀴즈를 생성할까요? (예/아니오)");
          currentQuizId = data.data.news_id;
          expectingKeyword = false;
      } else {
          appendMessage("bot", "현재 관련 뉴스가 존재하지 않습니다. 다른 키워드를 입력해주세요.");
      }
  } catch (error) {
      appendMessage("bot", error.error?.message || "네트워크 오류가 발생했습니다.");
  }
}

// 퀴즈 생성 요청 함수
async function fetchQuiz(newsId) {
  try {
      const response = await fetch(`${BASE_URL}/quiz/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ news_id: newsId }),
      });
      if (!response.ok) throw await response.json();

      const data = await response.json();
      if (data.quiz) {
          appendMessage("bot", `퀴즈: ${data.quiz.question}`);
          appendMessage("bot", `선택지: ${data.quiz.options.join(", ")}`);
          appendMessage("bot", "정답 번호를 입력해주세요.");
          currentQuizId = data.quiz.quiz_id;
          expectingAnswer = true;
      }
  } catch (error) {
      appendMessage("bot", error.error?.message || "퀴즈 생성 중 오류가 발생했습니다.");
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
      if (!response.ok) throw await response.json();

      const data = await response.json();
      appendMessage("bot", data.data.is_correct ? "정답입니다! 🎉" : "오답입니다. 😢");
      appendMessage("bot", `해설: ${data.data.explanation}`);
      appendMessage("bot", "새로운 키워드를 입력해주세요.");
      resetState();
  } catch (error) {
      appendMessage("bot", error.error?.message || "정답 제출 중 오류가 발생했습니다.");
  }
}

// 상태 초기화 함수
function resetState() {
  currentQuizId = null;
  expectingKeyword = true;
  expectingAnswer = false;
}

// 사용자 메시지 처리 함수
async function handleUserMessage(userMessage) {
  appendMessage("user", userMessage);

  if (expectingKeyword) {
      await fetchNewsSummary(userMessage);
  } else if (expectingAnswer) {
      const userAnswer = parseInt(userMessage, 10);
      if (!isNaN(userAnswer)) {
          await submitQuizAnswer(currentQuizId, userAnswer);
      } else {
          appendMessage("bot", "유효한 정답 번호를 입력해주세요.");
      }
  } else if (userMessage.toLowerCase() === "예") {
      await fetchQuiz(currentQuizId);
  } else if (userMessage.toLowerCase() === "아니오") {
      appendMessage("bot", "새로운 키워드를 입력해주세요.");
      resetState();
  } else {
      appendMessage("bot", "'예' 또는 '아니오'로 응답해주세요.");
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

// 자동 스크롤 함수
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}



// 초기 메시지
document.addEventListener("DOMContentLoaded", () => {
  appendMessage("bot", "안녕하세요, Fin-Edu입니다. 키워드를 입력해주세요.");
});

