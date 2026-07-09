-- RevTrack Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)

-- Create Role enum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'REP');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'REP',
    "hubspotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create CommissionPlan table
CREATE TABLE "CommissionPlan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "baseRate" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "acceleratorRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionPlan_pkey" PRIMARY KEY ("id")
);

-- Create Deal table
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "hubspotDealId" TEXT NOT NULL,
    "dealName" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "stage" TEXT NOT NULL,
    "closeDate" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "commissionEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_hubspotId_key" ON "User"("hubspotId");
CREATE UNIQUE INDEX "Deal_hubspotDealId_key" ON "Deal"("hubspotDealId");

-- Create foreign key
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Auto-update updatedAt trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "User_updatedAt" BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "CommissionPlan_updatedAt" BEFORE UPDATE ON "CommissionPlan"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER "Deal_updatedAt" BEFORE UPDATE ON "Deal"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
