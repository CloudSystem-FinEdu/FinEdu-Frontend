// DOM 요소 선택
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// 상태 변수
let expectingCategory = true; // 카테고리 입력 대기
let expectingQuizConsent = false; // "퀴즈를 푸시겠습니까?" 응답 대기
let currentNewsId = null; // 현재 선택된 뉴스 ID

// 상태 변수
let currentQuizId = null; // 현재 진행 중인 퀴즈 ID
let expectingAnswer = false; // 사용자의 퀴즈 정답 대기 상태

// 메시지 추가 함수
function appendMessage(sender, message) {
    // 메시지 컨테이너
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");

    // 메시지 내용
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    messageContent.textContent = message;

    // 메시지 구조 추가
    messageDiv.appendChild(messageContent);
    chatWindow.appendChild(messageDiv);

    // 새 메시지가 보이도록 스크롤
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 챗봇 초기 메시지 표시
function showInitialBotMessage() {
  const initialMessage = "안녕하세요, FinEdu AI입니다. AI기반의 뉴스 요약 및 학습 서비스를 제공합니다. 카테고리를 입력하세요.";
  appendMessage("bot", initialMessage);
  resetState(); // 상태 초기화
}

// 상태 초기화 함수
function resetState() {
  expectingCategory = true;
  expectingQuizConsent = false;
  expectingAnswer = false;
  currentQuizId = null;
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
async function fetchNewsByCategory(category) {
  const today = getTodayDate(); // 오늘 날짜 가져오기
  try {
      const response = await fetch(`/news/summary?date=${today}&keyword=${encodeURIComponent(category)}`, {
          method: 'GET',
      });

      if (!response.ok) {
          throw new Error("뉴스 요약을 가져오는 데 실패했습니다.");
      }

      const data = await response.json();
        if (data.data && data.data.length > 0) {
            const news = data.data[0]; // 첫 번째 뉴스 데이터 가져오기
            currentQuizId = news.newsId; // 뉴스 ID 저장
            appendMessage("bot", `카테고리 [${category}]의 뉴스 요약: \n제목: ${news.title}\n내용: ${news.content}`);
            appendMessage("bot", "퀴즈를 푸시겠습니까? (예/아니오)");
            expectingQuizConsent = true; // 퀴즈 응답 대기
            expectingCategory = false; // 카테고리 입력 종료
        } else {
            appendMessage("bot", `죄송합니다. 카테고리 [${category}]에 대한 뉴스 데이터가 없습니다.`);
            showInitialBotMessage(); // 다시 초기 메시지로 돌아감
        }
    } catch (error) {
        appendMessage("bot", `뉴스 데이터를 가져오는 중 오류가 발생했습니다: ${error.message}`);
        showInitialBotMessage(); // 다시 초기 메시지로 돌아감
    }
}

// 퀴즈 생성 요청 함수
async function generateQuiz() {
  try {
      const response = await fetch(`/quiz/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ news_id: currentNewsId }),
      });

      if (!response.ok) {
          throw new Error("퀴즈 생성에 실패했습니다.");
      }

      const data = await response.json();
      if (data.status === "success" && data.quiz) {
            const quiz = data.quiz;
            currentQuizId = quiz.id; // 퀴즈 ID 저장
            appendMessage("bot", `퀴즈: ${quiz.question}`);
            appendMessage("bot", `선택지: ${quiz.options.join(", ")}`);
            expectingQuizConsent = false;
            expectingAnswer = true; // 정답 입력 대기
        } else {
            appendMessage("bot", "퀴즈를 생성할 수 없습니다.");
            showInitialBotMessage(); // 다시 초기 메시지로 돌아감
        }
    } catch (error) {
        appendMessage("bot", `퀴즈 생성 중 오류가 발생했습니다: ${error.message}`);
        showInitialBotMessage(); // 다시 초기 메시지로 돌아감
    }
}

// 퀴즈 정답 제출 함수
async function submitQuizAnswer(userAnswer) {
  try {
      const response = await fetch(`/quiz/${currentQuizId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAnswer }),
      });

      if (!response.ok) {
          throw new Error("퀴즈 정답 제출에 실패했습니다.");
      }

      const data = await response.json();
      const { isCorrect, explanation } = data.data;

      // 정답 여부 표시
      if (isCorrect) {
          appendMessage("bot", "정답입니다! 🎉");
      } else {
          appendMessage("bot", "오답입니다. 😢");
      }

      // 해설 제공
      appendMessage("bot", `해설: ${explanation}`);
      showInitialBotMessage(); // 다시 초기 메시지로 돌아감
  } catch (error) {
      appendMessage("bot", `퀴즈 답변 처리 중 오류가 발생했습니다: ${error.message}`);
      showInitialBotMessage(); // 다시 초기 메시지로 돌아감
  }
}

// 사용자 메시지 처리 함수
async function handleUserMessage(userMessage) {
  appendMessage("user", userMessage);

  if (expectingCategory) {
      // 사용자가 카테고리를 입력한 경우
      await fetchNewsByCategory(userMessage);
  } else if (expectingQuizConsent) {
      // 퀴즈 응답 처리
      if (userMessage.toLowerCase() === "예") {
          appendMessage("bot", "퀴즈를 준비 중입니다...");
          await generateQuiz();
      } else if (userMessage.toLowerCase() === "아니오") {
          appendMessage("bot", "다음에 또 만나요!");
          showInitialBotMessage(); // 다시 초기 메시지로 돌아감
      } else {
          appendMessage("bot", "죄송합니다. '예' 또는 '아니오'로 답변해주세요.");
      }
  } else if (expectingAnswer) {
      // 사용자가 퀴즈 정답을 입력한 경우
      const userAnswer = parseInt(userMessage, 10); // 사용자의 입력을 정수로 변환
      if (!isNaN(userAnswer)) {
          appendMessage("bot", "정답을 처리 중입니다...");
          await submitQuizAnswer(userAnswer);
      } else {
          appendMessage("bot", "유효한 숫자를 입력해주세요.");
      }
  } else {
      appendMessage("bot", "죄송합니다, 현재 퀴즈 정답 외의 메시지는 처리할 수 없습니다.");
  }

  // 입력 필드 초기화
  userInput.value = "";
}

// 버튼 클릭 이벤트
sendButton.addEventListener("click", () => {
    const userMessage = userInput.value.trim(); // 입력값 가져오기
    if (userMessage !== "") {
        // 사용자 메시지 추가
        appendMessage("user", userMessage);

        // 챗봇 응답 생성 및 추가
        const botResponse = generateBotResponse(userMessage);
        setTimeout(() => {
            appendMessage("bot", botResponse);
        }, 1000); // 응답 지연 시간 (1초)

        // 입력 필드 비우기
        userInput.value = "";
    }
});

// 엔터키로도 메시지 전송
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendButton.click();
    }
});

// 페이지 로드 시 초기 메시지 표시
document.addEventListener("DOMContentLoaded", () => {
  showInitialBotMessage();
});

