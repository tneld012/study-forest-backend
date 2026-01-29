import { getStudyList } from "../services/study.service.js";
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
    const result = await getStudyList({
      page: pageNumber,
      pageSize: safePageSizeNumber,
      keyword,
      sort,
    });

    return sendSuccess(res, {
      message: "스터디 목록을 성공적으로 불러왔습니다!",
      data: result,
    });
  } catch (error) {
    next(error); // 예상하지 못한 에러는 미들웨어에 넘기기!
  }
}
