// 쿠키 옵션을 한 곳에서 관리하기 위한 유틸

// 🍪 브라우저에 저장될 쿠키의 보안 설정값들
export function getAccessTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true, // 자바스크립트로 쿠키 탈취 방지 (보안 필수!)
    secure: isProduction, // HTTPS 연결에서만 쿠키 전송 (배포 시 true)
    sameSite: "lax", // 기본적인 CSRF 공격 방어 설정
    path: "/", // 사이트 전체 경로에서 이 쿠키 사용
  };
}

// .env에 설정한 쿠키 이름을 가져오기
export function getCookieName() {
  return process.env.COOKIE_NAME || "access_token";
}
