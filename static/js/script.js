document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatMessages = document.getElementById("chat-messages");

  // Send button click event
  sendButton.addEventListener("click", () => {
      const userMessage = userInput.value.trim();
      if (userMessage !== "") {
          appendMessage("User", userMessage);
          userInput.value = ""; // Clear input
          simulateBotResponse(userMessage);
      }
  });

  // Append message to chat window
  function appendMessage(sender, message) {
      const messageDiv = document.createElement("div");
      messageDiv.textContent = `${sender}: ${message}`;
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
  }

  // Simulate bot response
  function simulateBotResponse(message) {
      setTimeout(() => {
          appendMessage("Bot", `You said: "${message}"`);
      }, 1000);
  }
});
