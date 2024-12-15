import { appendMessage } from "./dom.js";
import { resetState } from "./state.js";

const BASE_URL = "http://localhost:8080";

// 뉴스 요약 요청
export async function fetchNewsSummary(keyword) {
  const today = getTodayDate();
  try {
    const response = await fetch(`${BASE_URL}/news/summary?date=${today}&keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      appendMessage("bot", "해당 키워드의 뉴스를 찾을 수 없습니다. 다시 입력해주세요.");
      return false;
    }

    const data = await response.json();
    appendMessage("bot", `키워드 [${keyword}]에 대한 뉴스:`);
    appendMessage("bot", `제목: ${data.summary_title}`);
    appendMessage("bot", `내용: ${data.summary_content}`);
    return data.summaryId;
  } catch {
    appendMessage("bot", "서버 처리 중 오류가 발생했습니다.");
    resetState();
  }
}

// 오늘 날짜 구하기 함수
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}
