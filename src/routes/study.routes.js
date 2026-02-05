import express from "express"; // Express 모듈 불러오기
import requireAuth from "../middlewares/requireAuth.js";
import requireStudyExists from "../middlewares/requireStudyExists.js";
import requireStudyOwner from "../middlewares/requireStudyOwner.js";
import {
  createStudy,
  getPublicStudyList,
  getPublicStudyDetail,
  updateStudy,
} from "../controllers/study.controller.js";

const router = express.Router(); // 라우터 객체 생성

// 📘 스터디 생성 - POST /api/studies 요청을 받아 로그인 확인(requireAuth) 후 createStudy 컨트롤러와 연결
router.post("/", requireAuth, createStudy);

// 📘 공개 스터디 목록 조회 - GET /api/studies 요청을 받아 getPublicStudyList 컨트롤러와 연결
router.get("/", getPublicStudyList);

// 📘 공개 스터디 상세 조회 - GET /api/studies/:studyId 요청을 받아 getPublicStudyDetail 컨트롤러와 연결
router.get("/:studyId", getPublicStudyDetail);

// 📘 스터디 수정 - PATCH /api/studies/:studyId 요청을 받아 로그인(requireAuth), 존재 여부(requireStudyExists), 방장 권한(requireStudyOwner) 확인 후 updateStudy 컨트롤러와 연결
router.patch(
  "/:studyId",
  requireAuth,
  requireStudyExists("studyId"),
  requireStudyOwner("studyId"),
  updateStudy
);

export default router;
