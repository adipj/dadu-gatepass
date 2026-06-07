-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'FACULTY', 'VISITOR', 'HOSTEL_SUPERINTENDENT', 'CONFERENCE_SUPERVISOR', 'ADMIN', 'GATE_SECURITY');

-- CreateEnum
CREATE TYPE "PassType" AS ENUM ('STUDENT', 'FACULTY', 'VISITOR', 'CONFERENCE_PARTICIPANT', 'INVITED_VISITOR', 'VEHICLE_RFID');

-- CreateEnum
CREATE TYPE "PassStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GateAction" AS ENUM ('ENTRY', 'EXIT', 'DENIED');

-- CreateEnum
CREATE TYPE "ScanMethod" AS ENUM ('QR', 'RFID');

-- CreateEnum
CREATE TYPE "CampusStatus" AS ENUM ('ON_CAMPUS', 'OFF_CAMPUS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "role" "Role" NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "CampusStatus" NOT NULL DEFAULT 'OFF_CAMPUS',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pass" (
    "id" TEXT NOT NULL,
    "type" "PassType" NOT NULL,
    "status" "PassStatus" NOT NULL DEFAULT 'PENDING',
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "holder_id" TEXT NOT NULL,
    "applicant_id" TEXT,
    "approved_by" TEXT,
    "rfid_id" TEXT,

    CONSTRAINT "Pass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpRecord" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfidTag" (
    "id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "status" "CampusStatus" NOT NULL DEFAULT 'ON_CAMPUS',
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "vehicleNum" TEXT NOT NULL,

    CONSTRAINT "RfidTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateLog" (
    "id" TEXT NOT NULL,
    "action" "GateAction" NOT NULL,
    "method" "ScanMethod" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pass_id" TEXT NOT NULL,
    "checked_by" TEXT NOT NULL,

    CONSTRAINT "GateLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "OtpRecord_phone_key" ON "OtpRecord"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RfidTag_tag_id_key" ON "RfidTag"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "RfidTag_vehicleNum_key" ON "RfidTag"("vehicleNum");

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_holder_id_fkey" FOREIGN KEY ("holder_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_rfid_id_fkey" FOREIGN KEY ("rfid_id") REFERENCES "RfidTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateLog" ADD CONSTRAINT "GateLog_pass_id_fkey" FOREIGN KEY ("pass_id") REFERENCES "Pass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateLog" ADD CONSTRAINT "GateLog_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
