import express from "express"; // Express 모듈 불러오기
import { getPublicStudyList } from "../controllers/study.controller.js";

const router = express.Router(); // 라우터 객체 생성

// 📘 공개 스터디 목록 조회 - GET /api/studies 요청을 받아 getPublicStudyList 컨트롤러와 연결
router.get("/", getPublicStudyList);

export default router;
