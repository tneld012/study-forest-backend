// 모듈 불러오기
import express from "express"; // Express 프레임워크
import cors from "cors"; // 교차 리소스 공유 허용 설정
import helmet from "helmet"; // 보안을 위해 HTTP 헤더 설정
import cookieParser from "cookie-parser"; // 클라이언트의 쿠키를 req.cookies로 파싱
import prisma from "./prisma/client.js"; // Prisma Client
import apiRouter from "./routes/index.js"; // 라우터 객체
import { sendFail } from "./utils/response.js"; // API 실패 응답 유틸

// Express 애플리케이션 객체 생성
const app = express();

// 미들웨어 적용시키기
app.use(helmet()); // 보안 관련 미들웨어
app.use(
  cors({
    origin: "http://localhost:5173", // 허용할 도메인 주소. 현재는 Vite(React/Vue)의 기본 포트인 5173 허용
    credentials: true, // 인증 정보(쿠키, 인증 헤더 등)를 요청에 포함할지 여부
  })
); // CORS 허용 (나중에 프로트엔드 도메인 허용하게 추가!)
app.use(express.json()); // JSON body를 JavaScript 객체로 파싱
app.use(cookieParser()); // 쿠키 데이터 처리

// 헬스 체크
app.get("/health", (req, res) => {
  res.json({
    result: "success",
    message: "공부의 숲 백엔드 잘 돌아갑니다~~!🌳",
  });
});

// db 연결 테스트
app.get("/db-check", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ result: "success", message: "DB 연결 성공!" });
  } catch (error) {
    next(error);
  }
});

// 📍 API Prefix 라우팅
app.use("/api", apiRouter);

// 404 처리
app.use((req, res) => {
  return sendFail(res, {
    statusCode: 400,
    message: "요청하신 API 경로를 찾을 수 없습니다:(",
  });
});

// 공통 에러 핸들러 미들웨어
app.use((error, req, res, _next) => {
  console.error(error); // 서버 콘솔에 에러 기록

  return sendFail(res, {
    statusCode: 500,
    message: "서버 내부 오류가 발생했습니다:(",
    data: null,
  });
});

// app 객체를 다른 파일에서 사용할 수 있도록 export
export default app;
