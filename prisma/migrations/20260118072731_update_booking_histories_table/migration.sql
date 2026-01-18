/*
  Warnings:

  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_booking_close_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_booking_open_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `booking_histories` MODIFY `bh_booking_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `feedbacks` ALTER COLUMN `fb_created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `homestay_histories` MODIFY `hh_check_in_time` DATETIME NOT NULL,
    MODIFY `hh_check_out_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `packages` MODIFY `pk_start_date` DATETIME NULL,
    MODIFY `pk_due_date` DATETIME NULL,
    MODIFY `pk_booking_close_date` DATETIME NULL,
    MODIFY `pk_booking_open_date` DATETIME NULL;

-- AddForeignKey
ALTER TABLE `feedback_images` ADD CONSTRAINT `feedback_images_fi_feedback_id_fkey` FOREIGN KEY (`fi_feedback_id`) REFERENCES `feedbacks`(`fb_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
