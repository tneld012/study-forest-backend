// 모듈, 객체 불러오기
import dotenv from "dotenv"; // dotenv 모듈
import app from "./app.js"; // app.js에서 내보낸 app 객체를 가져옴

dotenv.config(); // .env 파일 읽기

const PORT = process.env.PORT || 4000; // 환경 변수에 PORT가 없으면, 기본값 4000 사용

app.listen(PORT, () => {
  console.log(`✅ 백엔드 작동 중! (${PORT}번 포트)`);
}); // 서버 실행
