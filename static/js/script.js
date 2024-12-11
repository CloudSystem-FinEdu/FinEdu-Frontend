// DOM 요소 선택
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

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
          appendMessage("bot", `카테고리 [${category}]의 뉴스 요약: \n제목: ${news.title}\n내용: ${news.content}`);
      } else {
          appendMessage("bot", `죄송합니다. 카테고리 [${category}]에 대한 뉴스 데이터가 없습니다.`);
      }

      expectingCategory = false; // 카테고리 입력 완료
  } catch (error) {
      appendMessage("bot", `뉴스 데이터를 가져오는 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 사용자 메시지 처리 함수
async function handleUserMessage(userMessage) {
  appendMessage("user", userMessage);

  if (expectingCategory) {
      // 사용자가 카테고리를 입력한 경우
      await fetchNewsByCategory(userMessage);
  } else {
      // 카테고리 외의 요청 처리
      appendMessage("bot", "죄송합니다, 이해하지 못했습니다.");
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

