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
  const initialMessage = "안녕하세요, FinEdu AI입니다. AI기반의 뉴스 요약 및 학습 서비스를 제공합니다.";
  appendMessage("bot", initialMessage);
}

// 챗봇 응답 생성 함수 (샘플 응답)
function generateBotResponse(userMessage) {
    if (userMessage.includes("안녕")) {
        return "안녕하세요! 무엇을 도와드릴까요?";
    } else if (userMessage.includes("날씨")) {
        return "오늘의 날씨는 맑음입니다!";
    } else {
        return "죄송합니다. 이해하지 못했어요.";
    }
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

