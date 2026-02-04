import prisma from "../prisma/client.js";

// 📘 스터디 존재 여부 확인
export async function findStudyById(studyId) {
  return prisma.study.findUnique({
    where: { id: studyId },
    select: { id: true, ownerId: true },
  });
}

// 🎫 My 멤버십 조회 (사용자가 해당 스터디에 참여되어 있는지 확인)
export async function findMyMembership({ studyId, userId }) {
  // 복합 키(studyId + userId)를 사용하여 멤버 정보 조회
  return prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId,
      },
    },
    select: {
      id: true,
      role: true,
      joinedAt: true,
    },
  });
}

// 🎫 스터디 참여하기 (신규 멤버 데이터 생성)
export async function joinStudyAsMember({ studyId, userId }) {
  // studyMember 테이블에 MEMBER 역할로 데이터 추가
  return prisma.studyMember.create({
    data: {
      studyId,
      userId,
      role: "MEMBER",
    },
    select: {
      id: true,
      studyId: true,
      userId: true,
      role: true,
      joinedAt: true,
    },
  });
}

// 🎫 스터디 탈퇴하기 (기존 멤버십 데이터 삭제)
export async function leaveStudy({ studyId, userId }) {
  // 복합 키를 사용하여 해당 멤버 데이터 삭제
  return prisma.studyMember.delete({
    where: {
      studyId_userId: {
        studyId,
        userId,
      },
    },
    select: {
      id: true,
      studyId: true,
      userId: true,
      role: true,
      joinedAt: true,
    },
  });
}
