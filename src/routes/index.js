// 모듈 불러오기
import express from "express";
import authRoutes from "./auth.routes.js";
import studyRoutes from "./study.routes.js";

// 라우터 객체 생성
const router = express.Router();

// 도메인 별 라우터 연결
router.use("/auth", authRoutes); // /api/auth 아래에 인증 관리 라우트 연결
router.use("/studies", studyRoutes); // /api/studies 아래에 스터디(Study) 관리 라우트 연결

export default router; // 다른 파일에서 사용할 수 있게 내보내기
