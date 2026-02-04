import express from "express"; // Express 모듈 불러오기
import requireAuth from "../middlewares/requireAuth.js";
import {
  createStudy,
  getPublicStudyList,
  getPublicStudyDetail,
} from "../controllers/study.controller.js";

const router = express.Router(); // 라우터 객체 생성

// 📘 스터디 생성 - POST /api/studies 요청을 받아 로그인 확인(requireAuth) 후 createStudy 컨트롤러와 연결
router.post("/", requireAuth, createStudy);

// 📘 공개 스터디 목록 조회 - GET /api/studies 요청을 받아 getPublicStudyList 컨트롤러와 연결
router.get("/", getPublicStudyList);

// 📘 공개 스터디 상세 조회 - GET /api/studies/:studyId 요청을 받아 getPublicStudyDetail 컨트롤러와 연결
router.get("/:studyId", getPublicStudyDetail);
export default router;
