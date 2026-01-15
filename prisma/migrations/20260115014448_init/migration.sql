-- CreateEnum
CREATE TYPE "public"."StudyMemberRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."FocusSessionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'STOPPED');

-- CreateEnum
CREATE TYPE "public"."StudyBackgroundKey" AS ENUM ('green', 'yellow', 'blue', 'pink', 'workspace_1', 'workspace_2', 'pattern', 'leaf');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."studies" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "introduce" TEXT NOT NULL,
    "background_key" "public"."StudyBackgroundKey" NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."study_members" (
    "id" UUID NOT NULL,
    "study_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "public"."StudyMemberRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."habits" (
    "id" UUID NOT NULL,
    "study_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."habit_checks" (
    "id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "study_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."focus_sessions" (
    "id" UUID NOT NULL,
    "study_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_seconds" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "elapsed_seconds" INTEGER,
    "status" "public"."FocusSessionStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."point_logs" (
    "id" UUID NOT NULL,
    "study_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "delta" INTEGER NOT NULL,
    "reference_type" VARCHAR(50) NOT NULL,
    "reference_id" UUID NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."emoji_catalog" (
    "id" UUID NOT NULL,
    "emoji_unified_code" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emoji_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."study_emoji_reactions" (
    "id" UUID NOT NULL,
    "study_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "emoji_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_emoji_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_likes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."study_comments" (
    "id" UUID NOT NULL,
    "study_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "study_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_studies_owner_id" ON "public"."studies"("owner_id");

-- CreateIndex
CREATE INDEX "idx_study_members_user_id" ON "public"."study_members"("user_id");

-- CreateIndex
CREATE INDEX "idx_study_members_study_id" ON "public"."study_members"("study_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_study_members_study_id_user_id" ON "public"."study_members"("study_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_habits_study_id" ON "public"."habits"("study_id");

-- CreateIndex
CREATE INDEX "idx_habit_checks_study_id_date" ON "public"."habit_checks"("study_id", "date");

-- CreateIndex
CREATE INDEX "idx_habit_checks_user_id_date" ON "public"."habit_checks"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_habit_checks_habit_id_user_id_date" ON "public"."habit_checks"("habit_id", "user_id", "date");

-- CreateIndex
CREATE INDEX "idx_focus_sessions_study_id_started_at" ON "public"."focus_sessions"("study_id", "started_at");

-- CreateIndex
CREATE INDEX "idx_focus_sessions_user_id_started_at" ON "public"."focus_sessions"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "idx_point_logs_study_id_created_at" ON "public"."point_logs"("study_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_point_logs_user_id_created_at" ON "public"."point_logs"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_emoji_catalog_emoji_unified_code" ON "public"."emoji_catalog"("emoji_unified_code");

-- CreateIndex
CREATE INDEX "idx_study_emoji_reactions_study_id_created_at" ON "public"."study_emoji_reactions"("study_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_study_emoji_reactions_emoji_id" ON "public"."study_emoji_reactions"("emoji_id");

-- CreateIndex
CREATE INDEX "idx_posts_author_id_created_at" ON "public"."posts"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_post_likes_user_id" ON "public"."post_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_post_likes_post_id_user_id" ON "public"."post_likes"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_post_comments_post_id_created_at" ON "public"."post_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_study_comments_study_id_created_at" ON "public"."study_comments"("study_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."studies" ADD CONSTRAINT "studies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_members" ADD CONSTRAINT "study_members_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_members" ADD CONSTRAINT "study_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_checks" ADD CONSTRAINT "habit_checks_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_checks" ADD CONSTRAINT "habit_checks_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_checks" ADD CONSTRAINT "habit_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."focus_sessions" ADD CONSTRAINT "focus_sessions_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."focus_sessions" ADD CONSTRAINT "focus_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."point_logs" ADD CONSTRAINT "point_logs_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."point_logs" ADD CONSTRAINT "point_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_emoji_reactions" ADD CONSTRAINT "study_emoji_reactions_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_emoji_reactions" ADD CONSTRAINT "study_emoji_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_emoji_reactions" ADD CONSTRAINT "study_emoji_reactions_emoji_id_fkey" FOREIGN KEY ("emoji_id") REFERENCES "public"."emoji_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_comments" ADD CONSTRAINT "post_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_comments" ADD CONSTRAINT "study_comments_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_comments" ADD CONSTRAINT "study_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
