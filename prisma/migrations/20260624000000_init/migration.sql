CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "GroupMemberStatus" AS ENUM ('REQUESTED', 'APPROVED', 'JOINED', 'ATTENDED', 'NO_SHOW', 'REJECTED');
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "GroupStatus" AS ENUM ('OPEN', 'FULL', 'CLOSED', 'COMPLETED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "ageRange" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "neighborhood" TEXT NOT NULL,
  "goals" TEXT[],
  "activities" TEXT[],
  "currentLevel" TEXT NOT NULL,
  "targetGoal" TEXT NOT NULL,
  "availability" TEXT[],
  "preferredGroupSize" INTEGER NOT NULL,
  "vibe" TEXT NOT NULL,
  "comfortPreference" TEXT NOT NULL,
  "phone" TEXT,
  "bio" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Goal" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activity" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Group" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "goalId" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "neighborhood" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "ageRange" TEXT NOT NULL,
  "vibe" TEXT NOT NULL,
  "maxMembers" INTEGER NOT NULL,
  "schedule" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "GroupStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupMember" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "status" "GroupMemberStatus" NOT NULL DEFAULT 'REQUESTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Event" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "locationName" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "description" TEXT NOT NULL,
  "hostName" TEXT NOT NULL,
  "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comfortScore" INTEGER NOT NULL,
  "groupMatchScore" INTEGER NOT NULL,
  "wouldAttendAgain" BOOLEAN NOT NULL,
  "comment" TEXT,
  "wouldInviteFriend" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");
CREATE UNIQUE INDEX "Goal_name_key" ON "Goal"("name");
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");
CREATE UNIQUE INDEX "GroupMember_userId_groupId_key" ON "GroupMember"("userId", "groupId");
CREATE UNIQUE INDEX "Feedback_userId_eventId_key" ON "Feedback"("userId", "eventId");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "UserPreference_city_neighborhood_idx" ON "UserPreference"("city", "neighborhood");
CREATE INDEX "UserPreference_currentLevel_idx" ON "UserPreference"("currentLevel");
CREATE INDEX "Group_city_neighborhood_status_idx" ON "Group"("city", "neighborhood", "status");
CREATE INDEX "Group_level_vibe_idx" ON "Group"("level", "vibe");
CREATE INDEX "GroupMember_groupId_status_idx" ON "GroupMember"("groupId", "status");
CREATE INDEX "Event_groupId_startTime_idx" ON "Event"("groupId", "startTime");
CREATE INDEX "Event_status_startTime_idx" ON "Event"("status", "startTime");
CREATE INDEX "Feedback_eventId_idx" ON "Feedback"("eventId");

ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Group" ADD CONSTRAINT "Group_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Group" ADD CONSTRAINT "Group_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
