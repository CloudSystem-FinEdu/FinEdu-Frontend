import { appendMessage } from "./dom.js";
import { resetState } from "./state.js";

// 초기 메시지 출력
export function displayInitialMessage() {
  appendMessage("bot", "안녕하세요, Fin-Edu입니다. 금융 뉴스와 관련된 정보를 제공합니다.");
  appendMessage("bot", "키워드를 입력해 관련 뉴스를 검색해보세요!");
}

// 초기 상태로 복원
export function resetToInitialMessage() {
  resetState();
  displayInitialMessage();
}
