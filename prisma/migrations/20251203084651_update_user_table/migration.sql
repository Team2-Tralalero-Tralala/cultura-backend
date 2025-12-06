/*
  Warnings:

  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_booking_close_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_booking_open_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `communityId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `packages_pk_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `packages_pk_overseer_member_id_fkey`;

-- AlterTable
ALTER TABLE `booking_histories` ALTER COLUMN `bh_booking_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `feedbacks` ALTER COLUMN `fb_created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `homestay_histories` MODIFY `hh_check_in_time` DATETIME NOT NULL,
    MODIFY `hh_check_out_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `packages` MODIFY `pk_location_id` INTEGER NULL,
    MODIFY `pk_overseer_member_id` INTEGER NULL,
    MODIFY `pk_name` VARCHAR(100) NULL,
    MODIFY `pk_description` VARCHAR(500) NULL,
    MODIFY `pk_capacity` INTEGER NULL,
    MODIFY `pk_price` DOUBLE NULL,
    MODIFY `pk_warning` VARCHAR(200) NULL,
    MODIFY `pk_start_date` DATETIME NULL,
    MODIFY `pk_due_date` DATETIME NULL,
    MODIFY `pk_facility` VARCHAR(200) NULL,
    MODIFY `pk_booking_close_date` DATETIME NULL,
    MODIFY `pk_booking_open_date` DATETIME NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `communityId`;

-- AddForeignKey
ALTER TABLE `communities` ADD CONSTRAINT `communities_ct_admin_id_fkey` FOREIGN KEY (`ct_admin_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_location_id_fkey` FOREIGN KEY (`pk_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_overseer_member_id_fkey` FOREIGN KEY (`pk_overseer_member_id`) REFERENCES `users`(`us_id`) ON DELETE SET NULL ON UPDATE CASCADE;
