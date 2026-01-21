// 모듈 불러오기
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET; // 서명(위조 방지)을 위한 비밀 키
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // 토큰 유효 기간 (기본값 7일)

// 🔑 액세스 토큰 생성 (입장권 발급)
export function signAccessToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다:(");
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// 🔍 액세스 토큰 검증 (입장권 확인)
export function verifyAccessToken(token) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다:(");
  }

  return jwt.verify(token, JWT_SECRET);
}
