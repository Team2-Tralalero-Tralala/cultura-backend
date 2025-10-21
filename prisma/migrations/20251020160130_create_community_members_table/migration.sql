/*
  Warnings:

  - The values [CANCELLED] on the enum `booking_histories_bh_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ct_bank_account_id` on the `communities` table. All the data in the column will be lost.
  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `us_member_of_community` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `communities` DROP FOREIGN KEY `communities_ct_admin_id_fkey`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_st_community_id_fkey`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_st_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_us_member_of_community_fkey`;

-- DropIndex
DROP INDEX `communities_ct_admin_id_key` ON `communities`;

-- DropIndex
DROP INDEX `communities_ct_bank_account_id_idx` ON `communities`;

-- DropIndex
DROP INDEX `communities_ct_bank_account_id_key` ON `communities`;

-- DropIndex
DROP INDEX `users_us_member_of_community_fkey` ON `users`;

-- AlterTable
ALTER TABLE `booking_histories` ALTER COLUMN `bh_booking_at` DROP DEFAULT,
    MODIFY `bh_status` ENUM('PENDING', 'BOOKED', 'REJECTED', 'REFUND_PENDING', 'REFUNDED', 'REFUND_REJECTED') NULL;

-- AlterTable
ALTER TABLE `communities` DROP COLUMN `ct_bank_account_id`;

-- AlterTable
ALTER TABLE `feedbacks` ALTER COLUMN `fb_created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `homestay_histories` MODIFY `hh_check_in_time` DATETIME NOT NULL,
    MODIFY `hh_check_out_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `packages` MODIFY `pk_start_date` DATETIME NOT NULL,
    MODIFY `pk_due_date` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `us_member_of_community`,
    ADD COLUMN `communityId` INTEGER NULL;

-- CreateTable
CREATE TABLE `community_members` (
    `cm_id` INTEGER NOT NULL AUTO_INCREMENT,
    `cm_community_id` INTEGER NOT NULL,
    `cm_member_id` INTEGER NOT NULL,

    INDEX `community_members_cm_community_id_idx`(`cm_community_id`),
    INDEX `community_members_cm_member_id_idx`(`cm_member_id`),
    PRIMARY KEY (`cm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_community_id_fkey` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_location_id_fkey` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_location_id_fkey` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_communityId_fkey` FOREIGN KEY (`communityId`) REFERENCES `communities`(`ct_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_cm_member_id_fkey` FOREIGN KEY (`cm_member_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_cm_community_id_fkey` FOREIGN KEY (`cm_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
