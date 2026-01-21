// 모듈 불러오기
import express from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import requireAuth from "../middlewares/requireAuth.js"; // 인증 관련 처리 함수 (컨트롤러) 불러오기

// 라우터 객체 생성
const router = express.Router();

// 🔐 회원가입 - POST /api/auth/register 요청을 받아 register 컨트롤러와 연결
router.post("/register", register);

// 🔐 로그인 - POST /api/auth/login 요청을 받아 login 컨트롤러와 연결
router.post("/login", login);

// 🔐 로그아웃 - POST /api/auth/logout 요청을 받아 logout 컨트롤러와 연결
router.post("/logout", logout);

// 🙋 내 정보 (로그인 확인용) - GET /api/auth/me 요청을 받아 me 컨트롤러와 연결 (내 정보를 확인하려면 토큰이 있는지 먼저 검사)
router.get("/me", requireAuth, me);

export default router;
