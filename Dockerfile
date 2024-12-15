# Node.js 이미지 사용 (Slim 버전으로 경량화)
FROM node:20-slim

# 작업 디렉터리 설정
WORKDIR /usr/src/app

# 프로젝트 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치 (http-server만 설치)
RUN npm install --only=prod http-server

# 정적 파일 복사 (불필요한 파일 제외)
COPY static/ static/
COPY templates/ templates/

# 포트 노출
EXPOSE 3000

# 정적 파일 제공
CMD ["npx", "http-server", ".", "-p", "3000"]


