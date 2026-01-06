/*
  Warnings:

  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_booking_close_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_booking_open_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropForeignKey
ALTER TABLE `feedback_images` DROP FOREIGN KEY `feedback_images_fi_feedback_id_fkey`;

-- DropIndex
DROP INDEX `feedback_images_fi_feedback_id_key` ON `feedback_images`;

-- AlterTable
ALTER TABLE `booking_histories` ADD COLUMN `bh_is_participate` BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN `bh_booking_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `feedbacks` ALTER COLUMN `fb_created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `homestay_histories` MODIFY `hh_check_in_time` DATETIME NOT NULL,
    MODIFY `hh_check_out_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `packages` ADD COLUMN `pk_created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `pk_start_date` DATETIME NULL,
    MODIFY `pk_due_date` DATETIME NULL,
    MODIFY `pk_booking_close_date` DATETIME NULL,
    MODIFY `pk_booking_open_date` DATETIME NULL;