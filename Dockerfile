# Nginx 이미지를 기반으로 사용
FROM nginx:alpine

# 정적 파일 복사
COPY static/ /usr/share/nginx/html/static/
COPY templates/ /usr/share/nginx/html/

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]



