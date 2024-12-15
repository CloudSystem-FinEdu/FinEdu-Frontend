import { sendButton, userInput } from "./dom.js";
import { displayInitialMessage } from "./message.js";
import { fetchNewsSummary } from "./api.js";
import { resetToInitialMessage } from "./message.js";
import { currentQuizId, expectingKeyword } from "./state.js";

// 사용자 메시지 처리
async function handleUserMessage(userMessage) {
  if (expectingKeyword) {
    const quizId = await fetchNewsSummary(userMessage);
    if (quizId) {
      currentQuizId = quizId;
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

// 엔터키 이벤트
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendButton.click();
});

// 초기 메시지 출력
document.addEventListener("DOMContentLoaded", displayInitialMessage);
