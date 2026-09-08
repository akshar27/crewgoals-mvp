CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED');
CREATE TYPE "AttendanceStatus" AS ENUM ('ATTENDED', 'NO_SHOW');

ALTER TABLE "UserPreference" ADD COLUMN "photoUrl" TEXT;

CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "to" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventComment" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EventComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SafetyReport" (
  "id" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reportedUserId" TEXT,
  "groupId" TEXT,
  "eventId" TEXT,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserBlock" (
  "id" TEXT NOT NULL,
  "blockerId" TEXT NOT NULL,
  "blockedUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventAttendance" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EventAttendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InviteLink" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usedAt" TIMESTAMP(3),

  CONSTRAINT "InviteLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");
CREATE INDEX "EmailLog_userId_createdAt_idx" ON "EmailLog"("userId", "createdAt");
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");
CREATE INDEX "EventComment_eventId_createdAt_idx" ON "EventComment"("eventId", "createdAt");
CREATE INDEX "EventComment_userId_idx" ON "EventComment"("userId");
CREATE INDEX "SafetyReport_status_createdAt_idx" ON "SafetyReport"("status", "createdAt");
CREATE INDEX "SafetyReport_reporterId_idx" ON "SafetyReport"("reporterId");
CREATE INDEX "SafetyReport_reportedUserId_idx" ON "SafetyReport"("reportedUserId");
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedUserId_key" ON "UserBlock"("blockerId", "blockedUserId");
CREATE INDEX "UserBlock_blockedUserId_idx" ON "UserBlock"("blockedUserId");
CREATE UNIQUE INDEX "EventAttendance_eventId_userId_key" ON "EventAttendance"("eventId", "userId");
CREATE INDEX "EventAttendance_eventId_status_idx" ON "EventAttendance"("eventId", "status");
CREATE INDEX "EventAttendance_userId_idx" ON "EventAttendance"("userId");
CREATE UNIQUE INDEX "InviteLink_token_key" ON "InviteLink"("token");
CREATE INDEX "InviteLink_groupId_idx" ON "InviteLink"("groupId");
CREATE INDEX "InviteLink_createdById_idx" ON "InviteLink"("createdById");

ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventComment" ADD CONSTRAINT "EventComment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventComment" ADD CONSTRAINT "EventComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InviteLink" ADD CONSTRAINT "InviteLink_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InviteLink" ADD CONSTRAINT "InviteLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
