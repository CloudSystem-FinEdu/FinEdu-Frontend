const mockNewsSummary = {
  summaryId: 8,
  newsId: 5,
  summaryTitle: "원/달러 환율 17.8원 오른 1,437.0원(15:30 종가)",
  summaryContent: "카카오톡 okjebo를 통해 제보가 가능하다는 내용을 다룬 금융 뉴스 송출",
  keywords: "카카오톡, 제보, 금융",
  originalUrl: "https://www.yna.co.kr/view/AKR20241209113600002?section=economy/finance",
  publishTime: "2024-12-10T00:30:00",
};

const mockQuiz = {
  status: "success",
  quiz: {
    quiz_id: "1",
    news_id: "1",
    summary_id: "1",
    quiz_title: "",
    question: "2024년 12월 6일 주식 시장의 상태는?",
    options: ["폭락", "상승", "보합", "급등"],
  },
};

const mockQuizAnswer = {
  data: {
    quiz_id: "1",
    is_correct: true,
    explanation: "정답은 3%입니다. 올해 경제가 개선된 주요 원인 중 하나는 수출 증가입니다.",
  },
};

// __tests__/chatLogic.test.js
import { fetchNewsSummary, fetchQuiz, submitQuizAnswer } from '../static/js/script.js"'; // 실제 함수 경로

// Jest의 fetch를 mock 처리
beforeEach(() => {
  fetch.resetMocks();
});

// 테스트 1: 뉴스 요약 데이터 가져오기
test("fetchNewsSummary should update the UI with news data", async () => {
  // Mock fetch 응답 설정
  fetch.mockResponseOnce(JSON.stringify(mockNewsSummary));

  // 테스트 함수 실행
  const keyword = "카카오톡";
  await fetchNewsSummary(keyword);

  // API 호출 확인
  expect(fetch).toHaveBeenCalledWith(
    `http://localhost:8080/news/summary?date=${new Date().toISOString().split("T")[0]}&keyword=${encodeURIComponent(keyword)}`
  );

  // UI 업데이트 확인 (mock 데이터가 화면에 제대로 표시되는지)
  const messages = document.querySelectorAll(".bot-message .message-content");
  expect(messages[messages.length - 3].innerHTML).toBe(`키워드 [${keyword}]에 대한 뉴스:`);
  expect(messages[messages.length - 2].innerHTML).toBe(`제목: ${mockNewsSummary.summaryTitle}`);
  expect(messages[messages.length - 1].innerHTML).toBe(`내용: ${mockNewsSummary.summaryContent}`);
});

// 테스트 2: 퀴즈 데이터 가져오기
test("fetchQuiz should update the UI with quiz data", async () => {
  // Mock fetch 응답 설정
  fetch.mockResponseOnce(JSON.stringify(mockQuiz));

  // 테스트 함수 실행
  const summaryId = mockNewsSummary.summaryId;
  await fetchQuiz(summaryId);

  // API 호출 확인
  expect(fetch).toHaveBeenCalledWith("http://localhost:8080/quiz/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ news_id: summaryId }),
  });

  // UI 업데이트 확인
  const messages = document.querySelectorAll(".bot-message .message-content");
  expect(messages[messages.length - 2].innerHTML).toBe(`퀴즈 질문: ${mockQuiz.quiz.question}`);
  expect(messages[messages.length - 1].innerHTML).toContain("1. 폭락");
});

// 테스트 3: 퀴즈 정답 제출
test("submitQuizAnswer should display correct or incorrect message", async () => {
  // Mock fetch 응답 설정
  fetch.mockResponseOnce(JSON.stringify(mockQuizAnswer));

  // 테스트 함수 실행
  const quizId = mockQuiz.quiz.quiz_id;
  const userAnswer = 2; // 사용자 정답
  await submitQuizAnswer(quizId, userAnswer);

  // API 호출 확인
  expect(fetch).toHaveBeenCalledWith(`http://localhost:8080/quiz/${quizId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userAnswer }),
  });

  // UI 업데이트 확인
  const messages = document.querySelectorAll(".bot-message .message-content");
  expect(messages[messages.length - 2].innerHTML).toBe("정답입니다! 🎉");
  expect(messages[messages.length - 1].innerHTML).toBe(
    `해설: ${mockQuizAnswer.data.explanation}`
  );
});
