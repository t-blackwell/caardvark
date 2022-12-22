-- AlterTable
ALTER TABLE "user"
ADD COLUMN "email_verified" VARCHAR(1) NOT NULL DEFAULT 'N'
;

-- AlterTable
ALTER TABLE "user"
ADD CONSTRAINT ch_user_email_verified CHECK (email_verified IN ('Y', 'N'))
;