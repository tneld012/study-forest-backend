import { sendFail } from "../utils/response.js"; // API 실패 응답 유틸
import { verifyAccessToken } from "../utils/jwt.js"; // 액세스 토큰 검증 유틸
import { getCookieName } from "../utils/cookies.js"; // .env 쿠키 이름 유틸

// 🛡️ 인증 미들웨어: 요청 쿠키의 JWT를 검증하고 req.user를 채워줌
export default function requireAuth(req, res, next) {
  try {
    const cookieName = getCookieName();
    const token = req.cookies?.[cookieName];

    // 1. 토큰이 없으면 로그인 안 한 상태
    if (!token) {
      return sendFail(res, {
        statusCode: 401,
        message: "로그인이 필요합니다!",
      });
    }

    // 2. 토큰이 가짜인지, 만료됐는지 검증
    const payload = verifyAccessToken(token);

    // 3. 검증된 유저 ID를 컨트롤러에서 쓸 수 있게 전달
    req.user = {
      userId: payload.userId,
    };

    return next();
  } catch (error) {
    console.error(error);
    return sendFail(res, {
      statusCode: 401,
      message: "인증 토큰이 유효하지 않습니다:( 다시 로그인해 주세요!",
    });
  }
}
