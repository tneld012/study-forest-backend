import * as studyService from "../services/study.service.js";
import { sendSuccess, sendFail } from "../utils/response.js"; // API 성공·실패 응답 유틸

// 📘 스터디 목록 조회 (GET /api/studies)
export async function getPublicStudyList(req, res, next) {
  try {
    const { page = "1", pageSize = "6", keyword, sort = "recent" } = req.query;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    // 1. 유효성검사
    if (
      !Number.isInteger(pageNumber) ||
      pageNumber <= 0 ||
      !Number.isInteger(pageSizeNumber) ||
      pageSizeNumber <= 0
    ) {
      return sendFail(res, {
        statusCode: 400,
        message: "page와 pageSize는 1 이상의 정수여야 합니다!",
      });
    }

    const safePageSizeNumber = Math.min(pageSizeNumber, 30); // 한 번에 너무 큰 pageSize를 불러오면 무리가 되니까 안전하게 상한을 두기!

    // 2. service 호출 → 조건에 맞는 DB 조회
    const result = await studyService.getStudyList({
      page: pageNumber,
      pageSize: safePageSizeNumber,
      keyword,
      sort,
    });

    // 3. 응답 반환
    return sendSuccess(res, {
      message: "스터디 목록을 성공적으로 불러왔습니다!",
      data: result,
    });
  } catch (error) {
    next(error); // 예상하지 못한 에러는 미들웨어에 넘기기!
  }
}

// ✔️ UUID 형식 검사
function isValidUuid(value) {
  if (typeof value !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // UUID 표준 형식(8-4-4-4-12자리)을 정의한 정규 표현식
  return uuidRegex.test(value); // 정규식 패턴과 일치하는지 확인
}

// 📘 스터디 상세 조회 (GET /api/studies/:studyId)
export async function getPublicStudyDetail(req, res, next) {
  try {
    const { studyId } = req.params;

    // 1. studyId 유효성 검사
    if (!isValidUuid(studyId)) {
      return sendFail(res, {
        statusCode: 400,
        message: "studyId 형식이 올바르지 않습니다:( (UUID 형식이어야 합니다!)",
      });
    }

    // 2. service 호출 → studyId로 DB 조회
    const study = await studyService.getStudyDetailById(studyId);

    // 3. 스터디 존재하지 않으면 404 반환
    if (!study) {
      return sendFail(res, {
        statusCode: 404,
        message: "해당 스터디를 찾을 수 없습니다:(",
      });
    }

    // 4. 응답 반환
    return sendSuccess(res, {
      message: "스터디 상세 정보를 성공적으로 조회했습니다!",
      data: study,
    });
  } catch (error) {
    next(error);
  }
}
