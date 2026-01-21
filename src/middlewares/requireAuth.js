// ⚠️ 임시

// 🔐 인증 확인 미들웨어
// 지금은 개발 단계라 모든 요청을 무조건 통과!
export default function requireAuth(req, res, next) {
  // 지금은 무조건 통과
  next();
}
