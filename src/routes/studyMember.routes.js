import express from "express"; // Express 모듈 불러오기
import requireAuth from "../middlewares/requireAuth.js";
import {
  getMyStudyMembership,
  joinStudy,
  leaveStudy,
} from "../controllers/studyMember.controller.js";

const router = express.Router({ mergeParams: true }); // 라우터 객체 생성

// 🎫 My 멤버십 확인 - GET /api/studies/:studyId/members/me 요청을 받아 로그인 확인(requireAuth) 후 getMysStudyMembership 컨트롤러와 연결
router.get("/me", requireAuth, getMyStudyMembership);

// 🎫 스터디 참여하기 - POST /api/studies/:studyId/members/join 요청을 받아 로그인 확인(requireAuth) 후 joinStudy 컨트롤러와 연결
router.post("/join", requireAuth, joinStudy);

// 🎫 스터디 탈퇴하기 - POST /api/studies/:studyId/members/leave 요청을 받아 로그인 확인(requireAuth) 후 leaveStudy 컨트롤러와 연결
router.post("/leave", requireAuth, leaveStudy);

export default router;
