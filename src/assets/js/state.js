// 상태 변수
export let currentQuizId = null;
export let expectingKeyword = true;
export let expectingQuizConsent = false;
export let expectingAnswer = false;

// 상태 리셋 함수
export function resetState() {
  currentQuizId = null;
  expectingKeyword = true;
  expectingQuizConsent = false;
  expectingAnswer = false;
}
