// ⚠️ 임시

// 모듈 불러오기
import { sendSuccess } from "../utils/response.js"; // API 성공 응답 유틸

// 🔐 회원가입 컨트롤러 (POST /api/auth/register)
export async function register(req, res) {
  return sendSuccess(res, {
    message: "register API (임시)",
  });
}

// 🔐 로그인 컨트롤러 (POST /api/auth/login)
export async function login(req, res) {
  return sendSuccess(res, {
    message: "login API (임시)",
  });
}

// 🔐 로그아웃 컨트롤러 (POST /api/auth/logout)
export async function logout(req, res) {
  return sendSuccess(res, {
    message: "logout API (임시)",
  });
}

// 🙋 내 정보 조회 컨트롤러 (GET /api/auth/me)
export async function me(req, res) {
  return sendSuccess(res, {
    message: "me API (임시)",
    data: null,
  });
}
