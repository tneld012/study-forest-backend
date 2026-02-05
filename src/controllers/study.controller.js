import * as studyService from "../services/study.service.js";
import { sendSuccess, sendFail } from "../utils/response.js"; // API 성공·실패 응답 유틸

// 🖼️ 배경 이미지 목록
const ALLOWED_BACKGROUND_KEYS = [
  "green",
  "yellow",
  "blue",
  "pink",
  "workspace_1",
  "workspace_2",
  "pattern",
  "leaf",
];

// 🔬 길이 유효성 검사 유틸 함수
function isValidStringLength(value, min, max) {
  if (typeof value !== "string") return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

// 📘 스터디 생성 (POST /api/studies)
export async function createStudy(req, res, next) {
  try {
    const userId = req.user?.userId;
    const { name, introduce, backgroundKey, isPublic } = req.body;

    // 1. 필수값 검사
    if (!name || !introduce || !backgroundKey) {
      return sendFail(res, {
        statusCode: 400,
        message: "스터디 이름, 소개, 배경 선택은 필수입니다!",
      });
    }

    // 2. 길이 규칙
    if (!isValidStringLength(name, 2, 30)) {
      return sendFail(res, {
        statusCode: 400,
        message: "스터디 이름은 2 ~ 30글자 사이여야 합니다!",
      });
    }

    if (!isValidStringLength(introduce, 2, 200)) {
      return sendFail(res, {
        statusCode: 400,
        message: "소개는 2 ~ 200글자 사이여야 합니다!",
      });
    }

    // 3. backgroundKey 허용값 체크
    if (!ALLOWED_BACKGROUND_KEYS.includes(backgroundKey)) {
      return sendFail(res, {
        statusCode: 400,
        message: "backgroundKey 값이 올바르지 않습니다:(",
      });
    }

    // 4. isPublic 기본값 처리
    const safeIsPublic = typeof isPublic === "boolean" ? isPublic : true;

    // 5. service 호출 → DB에 스터디 생성 + OWNER 자동 가입
    const createdStudy = await studyService.createStudy({
      ownerId: userId,
      name: name.trim(),
      introduce: introduce.trim(),
      backgroundKey,
      isPublic: safeIsPublic,
    });

    // 6. 응답 반환
    return sendSuccess(res, {
      statusCode: 201,
      message: "스터디가 성공적으로 생성되었습니다!",
      data: createdStudy,
    });
  } catch (error) {
    return next(error); // 예상하지 못한 에러는 미들웨어에 넘기기!
  }
}

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
    next(error); // 예상하지 못한 에러는 미들웨어에 넘기기!
  }
}

// 📘 스터디 수정 (PATCH /api/studies/:studyId)
export async function updateStudy(req, res, next) {
  try {
    const { studyId } = req.params;
    const { name, introduce, backgroundKey, isPublic } = req.body;

    // 1. 수정할 값이 하나도 없는 경우
    if (
      name === undefined &&
      introduce === undefined &&
      backgroundKey === undefined &&
      isPublic === undefined
    ) {
      return sendFail(res, {
        statusCode: 400,
        message: "수정할 값이 최소 1개 이상 필요합니다!",
      });
    }

    // 2. 개별 필드 유효성 검사
    if (name !== undefined && !isValidStringLength(name, 2, 30)) {
      return sendFail(res, {
        statusCode: 400,
        message: "스터디 이름은 2 ~ 30글자 사이여야 합니다!",
      });
    }

    if (introduce !== undefined && !isValidStringLength(introduce, 2, 200)) {
      return sendFail(res, {
        statusCode: 400,
        message: "소개는 2 ~ 200글자 사이여야 합니다!",
      });
    }

    if (backgroundKey !== undefined && !ALLOWED_BACKGROUND_KEYS.includes(backgroundKey)) {
      return sendFail(res, {
        statusCode: 400,
        message: "backgroundKey 값이 올바르지 않습니다:(",
      });
    }

    if (isPublic !== undefined && typeof isPublic !== "boolean") {
      return sendFail(res, {
        statusCode: 400,
        message: "isPublic은 boolean(true/false) 값이어야 합니다!",
      });
    }

    // 3. service 호출 → DB 수정 처리
    const updatedStudy = await studyService.updateStudy(studyId, {
      name: name !== undefined ? name.trim() : undefined,
      introduce: introduce !== undefined ? introduce.trim() : undefined,
      backgroundKey,
      isPublic,
    });

    // 3-1. 스터디가 존재하지 않는 경우 (Service에서 null 반환 시) 404 반환 (P2025)
    if (!updatedStudy) {
      return sendFail(res, {
        statusCode: 404,
        message: "해당 스터디를 찾을 수 없습니다:(",
      });
    }

    // 4. 응답 반환
    return sendSuccess(res, {
      message: "스터디 정보가 성공적으로 수정되었습니다!",
      data: updatedStudy,
    });
  } catch (error) {
    next(error); // 예상하지 못한 에러는 미들웨어에 넘기기!
  }
}
