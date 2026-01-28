import { sendFail } from "./utils/response.js"; // API 실패 응답 유틸
import requireStudyMember from "./requireStudyMember.js"; // 스터디 멤버 여부 확인 미들웨어

// 🛡️ 스터디 오너(스터디를 만든 방장)인지 확인하는 미들웨어
export default function requireStudyOwner(getStudyId) {
  return async function (req, res, next) {
    // 1. 먼저 스터디 멤버인지 확인
    const checkMember = requireStudyMember(getStudyId);

    return checkMember(req, res, (error) => {
      // 만약 멤버 확인 중 에러가 났다면 바로 에러 처리
      if (error) return next(error);

      // 2. 멤버임이 확인되었다면, req.studyMember에서 권한(role)을 확인
      const member = req.studyMember;

      // 3. 권한이 OWNER(방장)가 아니면 차단
      if (!member || member.role !== "OWNER") {
        return sendFail(res, {
          statusCode: 403,
          message: "스터디 오너(방장)만 수행할 수 있는 작업입니다!",
        });
      }

      return next();
    });
  };
}
