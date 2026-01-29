import prisma from "../prisma/client.js";

// 📘 스터디 목록 조회 (검색 + 정렬 + 페이지네이션)
export async function getStudyList({ page = 1, pageSize = 6, keyword, sort = "recent" }) {
  // 1. 검색 whrer 조건
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
