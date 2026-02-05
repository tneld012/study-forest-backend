import prisma from "../prisma/client.js";
import { sendFail } from "../utils/response.js";

// ✔️ UUID 형식 검사
function isValidUuid(value) {
  if (typeof value !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // UUID 표준 형식(8-4-4-4-12자리)을 정의한 정규 표현식
  return uuidRegex.test(value); // 정규식 패턴과 일치하는지 확인
}

// 🛡️ 스터디 존재 여부 확인 미들웨어
export default function requireStudyExists(getStudyId) {
  return async function (req, res, next) {
    try {
      const studyId =
        typeof getStudyId === "function" ? getStudyId(req) : req.params?.[getStudyId];

      // 1. studyId 누락 여부 검사
      if (!studyId) {
        return sendFail(res, {
          statusCode: 400,
          message: "studyId가 필요합니다!",
        });
      }

      // 2. UUID 형식 검사
      if (!isValidUuid(studyId)) {
        return sendFail(res, {
          statusCode: 400,
          message: "studyId 형식이 올바르지 않습니다:( (UUID 형식이어야 합니다!)",
        });
      }

      // 3. DB에 스터디 존재 여부 확인
      const study = await prisma.study.findUnique({
        where: { id: studyId },
        select: {
          id: true,
          ownerId: true,
          name: true,
          introduce: true,
          backgroundKey: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 3-1. 스터디가 존재하지 않을 경우 404 반환
      if (!study) {
        return sendFail(res, {
          statusCode: 404,
          message: "해당 스터디를 찾을 수 없습니다:(",
        });
      }

      // 4. 재사용을 위해 보관
      req.study = study;

      return next();
    } catch (error) {
      console.error(error);
      return sendFail(res, {
        statusCode: 500,
        message: "스터디 존재 여부 확인 중 오류가 발생했습니다:(",
      });
    }
  };
}
