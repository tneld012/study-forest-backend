import prisma from "../prisma/client.js"; // Prisma Client 불러오기
import { sendFail } from "../utils/response.js"; // API 실패 응답 유틸

// 🛡️ 스터디 멤버인지 확인하는 미들웨어
export default function requireStudyMember(getStudyId) {
  return async function (req, res, next) {
    try {
      // 1. 유저 ID와 스터디 ID 가져오기
      const userId = req.user?.userId;

      // 2. 로그인이 되어 있는지 가장 먼저 확인
      if (!userId) {
        return sendFail(res, {
          statusCode: 401,
          message: "로그인이 필요합니다!",
        });
      }

      // 3. 스터디 ID 파악하기
      const studyId =
        typeof getStudyId === "function" ? getStudyId(req) : req.params[getStudyId];

      // 4. 스터디 ID가 없는 경우 방어 코드
      if (!studyId) {
        return sendFail(res, {
          statusCode: 400,
          message: "스터디 ID가 필요합니다!",
        });
      }

      // 5. DB에서 해당 스터디에 이 유저가 있는지 조회
      const member = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId,
          },
        },
      });

      // 6. 멤버가 아닌 경우 차단
      if (!member) {
        return sendFail(res, {
          statusCode: 403,
          message: "해당 스터디의 멤버만 접근할 수 있습니다!",
        });
      }

      // 7. 멤버 정보를 요청 객체(req)에 보관
      // 이후 컨트롤러에서 role이 필요할 수도 있어서 넘겨줌
      req.studyMember = member;

      return next();
    } catch (error) {
      console.error(error);
      return sendFail(res, {
        statusCode: 500,
        message: "스터디 멤버 권한 확인 중 오류가 발생했습니다!",
      });
    }
  };
}
