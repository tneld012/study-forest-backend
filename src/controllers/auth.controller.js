import prisma from "../prisma/client.js"; // Prisma Client 불러오기
import bcrypt from "bcrypt"; // Node.js 애플리케이션에서 bcrypt 라이브러리를 가져오기(비밀번호 암호화용 라이브러리)
import { sendSuccess, sendFail } from "../utils/response.js"; // API 성공·실패 응답 유틸
import { signAccessToken } from "../utils/jwt.js"; // 액세스 토큰 생성 유틸
import { getAccessTokenCookieOptions, getCookieName } from "../utils/cookies.js"; // 쿠키 옵션 유틸

// ⚙️ bcrypt 암호화 강도 설정
const BCRYPT_SALT_ROUNDS = 10;

// 🔐 회원가입 컨트롤러 (POST /api/auth/register)
export async function register(req, res, next) {
  try {
    const { email, nickname, password } = req.body;

    // 1. 필수 데이터 입력 확인
    if (!email || !nickname || !password) {
      return sendFail(res, {
        statusCode: 400,
        message: "이메일, 닉네임, 비밀번호는 필수 입력 사항입니다!",
      });
    }

    // 2. 중복 이메일 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return sendFail(res, {
        statusCode: 409,
        message: "이미 가입된 이메일입니다. 다른 이메일을 사용해 주세요!",
      });
    }

    // ⚙️ 3. 비밀번호를 안전하게 암호화 (해싱)
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 4. DB에 유저 정보 저장
    const user = await prisma.user.create({
      data: { email, nickname, passwordHash },
      select: { id: true, email: true, nickname: true, createdAt: true },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "공부의 숲에 오신 것을 환영합니다! 🌳",
      data: user,
    });
  } catch (error) {
    return next(error); // 예상하지 못한 에러는 미들웨어에 넘기기!
  }
}

// 🔐 로그인 컨트롤러 (POST /api/auth/login)
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1. 필수 데이터 확인
    if (!email || !password) {
      return sendFail(res, {
        statusCode: 400,
        message: "이메일과 비밀번호를 모두 입력해주세요!",
      });
    }

    // 2. 가입된 유저인지 확인
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return sendFail(res, {
        statusCode: 401,
        message: "이메일 또는 비밀번호가 일치하지 않습니다:(",
      });
    }

    // 3. 비밀번호 일치 비교
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendFail(res, {
        statusCode: 401,
        message: "이메일 또는 비밀번호가 일치하지 않습니다:(",
      });
    }

    // 4. 입장권(JWT) 발급
    const token = signAccessToken({ userId: user.id });

    // 🍪 5. 쿠키에 담아서 전달
    const cookieName = getCookieName();
    res.cookie(cookieName, token, getAccessTokenCookieOptions());

    return sendSuccess(res, {
      message: "로그인에 성공했습니다!",
      data: { id: user.id, email: user.email, nickname: user.nickname },
    });
  } catch (error) {
    return next(error); // 예상하지 못한 에러는 미들웨어에 넘기기!
  }
}

// 🔐 로그아웃 컨트롤러 (POST /api/auth/logout)
export async function logout(req, res) {
  const cookieName = getCookieName();
  res.clearCookie(cookieName, { path: "/" }); // 🍪 쿠키 삭제

  return sendSuccess(res, {
    message: "로그아웃 되었습니다!",
  });
}

// 🙋 내 정보 조회 컨트롤러 (GET /api/auth/me)
export async function me(req, res, next) {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nickname: true, createdAt: true },
    });

    // 1. 유저 존재 확인
    if (!user) {
      return sendFail(res, {
        statusCode: 401,
        message: "사용자 정보를 찾을 수 없습니다:(",
      });
    }

    return sendSuccess(res, {
      message: "내 정보를 성공적으로 가져왔습니다!",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}
