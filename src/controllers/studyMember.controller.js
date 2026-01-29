import * as studyMemberService from "../services/studyMember.service.js";
import { sendSuccess, sendFail } from "../utils/response.js"; // API 성공·실패 응답 유틸

// ✔️ UUID 형식 검사
function isValidUuid(value) {
  if (typeof value !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // UUID 표준 형식(8-4-4-4-12자리)을 정의한 정규 표현식
  return uuidRegex.test(value); // 정규식 패턴과 일치하는지 확인
}

// 🎫 My 멤버십 상태 조회 (GET /api/studies/:studyId/members/me)
export async function getMyStudyMembership(req, res, next) {
  try {
    const { studyId } = req.params;
    const userId = req.user?.userId;

    // 1. studyId 유효성 검사
    if (!isValidUuid(studyId)) {
      return sendFail(res, {
        statusCode: 400,
        message: "studyId 형식이 올바르지 않습니다:( (UUID 형식이어야 합니다!)",
      });
    }

    // 2. service 호출 → 스터디 존재 여부 확인
    const study = await studyMemberService.findStudyById(studyId);

    // 3. 스터디 존재하지 않으면 404 반환
    if (!study) {
      return sendFail(res, {
        statusCode: 404,
        message: "해당 스터디를 찾을 수 없습니다:(",
      });
    }

    // 4. service 호출 → My 멤버십 조회
    const membership = await studyMemberService.findMyMembership({
      studyId,
      userId,
    });

    // 5. 응답 반환
    return sendSuccess(res, {
      message: "My 스터디 멤버십 상태를 조회했습니다!",
      data: {
        isMember: Boolean(membership),
        membership: membership ?? null,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// 🎫 스터디 참여하기 (POST /api/studies/:studyId/members/join)
export async function joinStudy(req, res, next) {
  try {
    const { studyId } = req.params;
    const userId = req.user?.userId;

    // 1. studyId 유효성 검사
    if (!isValidUuid(studyId)) {
      return sendFail(res, {
        statusCode: 400,
        message: "studyId 형식이 올바르지 않습니다:( (UUID 형식이어야 합니다!)",
      });
    }

    // 2. service 호출 → 스터디 존재 여부 확인
    const study = await studyMemberService.findStudyById(studyId);

    // 3. 스터디 존재하지 않으면 404 반환
    if (!study) {
      return sendFail(res, {
        statusCode: 404,
        message: "해당 스터디를 찾을 수 없습니다:(",
      });
    }

    // 4. 해당 멤버가 이미 참여되어 있는지 확인
    const existingMembership = await studyMemberService.findMyMembership({
      studyId,
      userId,
    });

    // 5. 이미 참여하고 있으면 409 반환
    if (existingMembership) {
      return sendFail(res, {
        statusCode: 409,
        message: "이미 참여 중인 스터디입니다!",
      });
    }

    // 6. service 호출 → 참여 멤버 생성
    const createdMembership = await studyMemberService.joinStudyAsMember({
      studyId,
      userId,
    });

    // 7. 응답 반환
    return sendSuccess(res, {
      statusCode: 201,
      message: "스터디에 성공적으로 참여했습니다!",
      data: createdMembership,
    });
  } catch (error) {
    return next(error);
  }
}

// 🎫 스터디 탈퇴하기 (POST /api/studies/:studyId/members/leave)
export async function leaveStudy(req, res, next) {
  try {
    const { studyId } = req.params;
    const userId = req.user?.userId;

    // 1. studyId 유효성 검사
    if (!isValidUuid(studyId)) {
      return sendFail(res, {
        statusCode: 400,
        message: "studyId 형식이 올바르지 않습니다:( (UUID 형식이어야 합니다!)",
      });
    }

    // 2. service 호출 → 스터디 존재 여부 확인
    const study = await studyMemberService.findStudyById(studyId);

    // 3. 스터디 존재하지 않으면 404 반환
    if (!study) {
      return sendFail(res, {
        statusCode: 404,
        message: "해당 스터디를 찾을 수 없습니다:(",
      });
    }

    // 4. service 호출 → 해당 유저의 참여 여부 확인
    const membership = await studyMemberService.findMyMembership({
      studyId,
      userId,
    });

    // 5. 참여 중인 멤버가 아니라면 404 반환
    if (!membership) {
      return sendFail(res, {
        statusCode: 404,
        message: "참여 중인 멤버가 아닙니다:(",
      });
    }

    // 6. OWNER(방장)은 탈퇴 불가
    if (membership.role === "OWNER") {
      return sendFail(res, {
        statusCode: 403,
        message: "스터디 OWNER(방장)은 탈퇴할 수 없습니다!",
      });
    }

    // 7. service 호출 → 탈퇴 처리 (데이터 삭제)
    const deletedMembership = await studyMemberService.leaveStudy({
      studyId,
      userId,
    });

    // 8. 응답 반환
    return sendSuccess(res, {
      message: "스터디에서 성공적으로 탈퇴하였습니다!",
      data: deletedMembership,
    });
  } catch (error) {
    return next(error);
  }
}
