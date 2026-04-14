-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatar_url` VARCHAR(191) NULL,
    ADD COLUMN `bio` VARCHAR(191) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `created_by` VARCHAR(191) NULL,
    ADD COLUMN `current_streak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `dob` DATETIME(3) NULL,
    ADD COLUMN `first_name` VARCHAR(191) NULL,
    ADD COLUMN `full_name` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `google_id` VARCHAR(191) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `is_delete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `last_activity_date` DATETIME(3) NULL,
    ADD COLUMN `last_name` VARCHAR(191) NULL,
    ADD COLUMN `locale` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `longest_streak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `otp_generated_time` DATETIME(3) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `ranking_points` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `refresh_token` VARCHAR(191) NULL,
    ADD COLUMN `reset_password_token` VARCHAR(191) NULL,
    ADD COLUMN `reset_password_token_expiry` DATETIME(3) NULL,
    ADD COLUMN `total_quizzes_completed` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `updated_by` VARCHAR(191) NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_google_id_key` ON `User`(`google_id`);

-- CreateIndex
CREATE UNIQUE INDEX `User_phone_key` ON `User`(`phone`);

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
