// DOM 요소 선택
export const chatWindow = document.getElementById("chat-window");
export const userInput = document.getElementById("user-input");
export const sendButton = document.getElementById("send-button");

// 메시지 추가 함수
export function appendMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.innerHTML = message;

  messageDiv.appendChild(messageContent);
  chatWindow.appendChild(messageDiv);
  scrollToBottom();
}

// 자동 스크롤 함수
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
