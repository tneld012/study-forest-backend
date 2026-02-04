import prisma from "../prisma/client.js";

// 📘 스터디 생성 (스터디 생성 + OWNER 멤버십 자동 가입)
export async function createStudy({ ownerId, name, introduce, backgroundKey, isPublic }) {
  // 1. 트랜잭션 실행 (스터디 생성 + OWNER 멤버십 자동 가입)
  const result = await prisma.$transaction(async (transactionClient) => {
    // 1-1. DB에 STUDY 행 저장
    const study = await transactionClient.study.create({
      data: {
        ownerId,
        name,
        introduce,
        backgroundKey,
        isPublic,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        introduce: true,
        backgroundKey: true,
        isPublic: true,
        createdAt: true,
      },
    });

    // 1-2. STUDYMEMBER 테이블에 OWNER 역할로 자동 가입
    await transactionClient.studyMember.create({
      data: {
        studyId: study.id,
        userId: ownerId,
        role: "OWNER",
      },
    });

    return study;
  });

  // 2. 프론트에 넘길 데이터
  return {
    studyId: result.id,
    ownerId: result.ownerId,
    name: result.name,
    introduce: result.introduce,
    backgroundKey: result.backgroundKey,
    isPublic: result.isPublic,
    createdAt: result.createdAt,
  };
}

// 📘 스터디 목록 조회 (검색 + 정렬 + 페이지네이션)
export async function getStudyList({ page = 1, pageSize = 6, keyword, sort = "recent" }) {
  // 1. 검색 where 조건
  const where = {
    isPublic: true, // 공개 스터디만!
  };

  const word = typeof keyword === "string" ? keyword.normalize().trim() : ""; // normalize() 메서드는 서로 다른 방식으로 인코딩된 문자열을 하나의 통일된 형식으로 변환하여 문자열 비교나 검색 시 오류를 방지하는 역할

  if (word.length > 0) {
    where.OR = [
      // 검색어가 있을 경우, 이름과 소개글에서 '부분 일치'하는 스터디를 조회
      { name: { contains: word, mode: "insensitive" } }, // 대소문자 구분 없이 검색
      { introduce: { contains: word, mode: "insensitive" } }, // 대소문자 구분 없이 검색
    ];
  }

  // 2. 정렬 옵션
  let orderBy;
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  // 3. 페이지네이션
  const skip = (page - 1) * pageSize;

  // 4. DB 데이터 조회
  const [totalCount, studies] = await Promise.all([
    prisma.study.count({ where }),
    prisma.study.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        introduce: true,
        backgroundKey: true,
        createdAt: true,

        pointLogs: {
          select: { delta: true },
        },

        studyEmojiReactions: {
          select: {
            emoji: {
              select: { emojiUnifiedCode: true },
            },
          },
        },
      },
    }),
  ]);

  // 5. 포인트 합산 + 이모지 Top 3 집계
  const studyList = studies.map((study) => {
    const totalPoints = study.pointLogs.reduce((sum, log) => sum + log.delta, 0);

    const emojiCountMap = {};
    for (const reaction of study.studyEmojiReactions) {
      const code = reaction.emoji.emojiUnifiedCode;
      emojiCountMap[code] = (emojiCountMap[code] || 0) + 1;
    }

    const topEmojis = Object.entries(emojiCountMap)
      .map(([emojiUnifiedCode, count]) => ({ emojiUnifiedCode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 7. 프론트에 넘길 데이터
    return {
      studyId: study.id,
      name: study.name,
      introduce: study.introduce,
      backgroundKey: study.backgroundKey,
      totalPoints,
      createdAt: study.createdAt,
      topEmojis,
    };
  });

  return {
    studies: studyList,
    pagination: {
      totalCount,
      hasNextPage: page * pageSize < totalCount,
    },
  };
}

// 📘 스터디 상세 조회
export async function getStudyDetailById(studyId) {
  // 1. DB 데이터 조회
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: {
      id: true,
      name: true,
      introduce: true,
      backgroundKey: true,
      createdAt: true,

      owner: {
        select: {
          id: true,
          nickname: true,
        },
      },

      pointLogs: {
        select: { delta: true },
      },

      studyEmojiReactions: {
        select: {
          emoji: {
            select: { emojiUnifiedCode: true },
          },
        },
      },
    },
  });

  // 2. 해당 스터디가 없는 경우 처리
  if (!study) return null;

  // 3. 포인트 합산 + 이모지 Top 3 집계
  const totalPoints = study.pointLogs.reduce((sum, log) => sum + log.delta, 0);

  const emojiCountMap = {};
  for (const reaction of study.studyEmojiReactions) {
    const code = reaction.emoji.emojiUnifiedCode;
    emojiCountMap[code] = (emojiCountMap[code] || 0) + 1;
  }

  const topEmojis = Object.entries(emojiCountMap)
    .map(([emojiUnifiedCode, count]) => ({ emojiUnifiedCode, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 4. 프론트에 넘길 데이터
  return {
    studyId: study.id,
    name: study.name,
    introduce: study.introduce,
    backgroundKey: study.backgroundKey,
    totalPoints,
    owner: {
      userId: study.owner.id,
      nickname: study.owner.nickname,
    },
    topEmojis,
  };
}
