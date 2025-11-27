/*
  Warnings:

  - The values [CANCELLED] on the enum `booking_histories_bh_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ct_bank_account_id` on the `communities` table. All the data in the column will be lost.
  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `st_community_id` on the `homestays` table. All the data in the column will be lost.
  - You are about to drop the column `st_location_id` on the `homestays` table. All the data in the column will be lost.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `us_member_of_community` on the `users` table. All the data in the column will be lost.
  - Added the required column `ht_community_id` to the `homestays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ht_location_id` to the `homestays` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `communities` DROP FOREIGN KEY `communities_ct_admin_id_fkey`;

-- DropForeignKey
ALTER TABLE `homestays` DROP FOREIGN KEY `homestays_st_community_id_fkey`;

-- DropForeignKey
ALTER TABLE `homestays` DROP FOREIGN KEY `homestays_st_location_id_fkey`;

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
DROP INDEX `homestays_st_community_id_idx` ON `homestays`;

-- DropIndex
DROP INDEX `homestays_st_location_id_idx` ON `homestays`;

-- DropIndex
DROP INDEX `users_us_member_of_community_fkey` ON `users`;

-- AlterTable
ALTER TABLE `booking_histories` ALTER COLUMN `bh_booking_at` DROP DEFAULT,
    MODIFY `bh_status` ENUM('PENDING', 'BOOKED', 'REJECTED', 'REFUND_PENDING', 'REFUNDED', 'REFUND_REJECTED') NULL;

-- AlterTable
ALTER TABLE `communities` DROP COLUMN `ct_bank_account_id`,
    ADD COLUMN `ct_is_rating_visible` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `feedbacks` ALTER COLUMN `fb_created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `homestay_histories` MODIFY `hh_check_in_time` DATETIME NOT NULL,
    MODIFY `hh_check_out_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `homestays` DROP COLUMN `st_community_id`,
    DROP COLUMN `st_location_id`,
    ADD COLUMN `ht_community_id` INTEGER NOT NULL,
    ADD COLUMN `ht_location_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `packages` ADD COLUMN `pk_booking_close_date` DATETIME NULL,
    ADD COLUMN `pk_booking_open_date` DATETIME NULL,
    MODIFY `pk_status_approve` ENUM('PENDING', 'APPROVE', 'PENDING_SUPER', 'REJECTED') NULL,
    MODIFY `pk_start_date` DATETIME NOT NULL,
    MODIFY `pk_due_date` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `us_member_of_community`,
    ADD COLUMN `communityId` INTEGER NULL;

-- CreateTable
CREATE TABLE `community_members` (
    `cm_id` INTEGER NOT NULL AUTO_INCREMENT,
    `cm_community_id` INTEGER NOT NULL,
    `cm_member_id` INTEGER NOT NULL,
    `cm_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `cm_delete_at` TIMESTAMP(0) NULL,

    INDEX `community_members_cm_community_id_idx`(`cm_community_id`),
    INDEX `community_members_cm_member_id_idx`(`cm_member_id`),
    PRIMARY KEY (`cm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `homestays_ht_community_id_idx` ON `homestays`(`ht_community_id`);

-- CreateIndex
CREATE INDEX `homestays_ht_location_id_idx` ON `homestays`(`ht_location_id`);

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_community_id_fkey` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_location_id_fkey` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `homestays_ht_community_id_fkey` FOREIGN KEY (`ht_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `homestays_ht_location_id_fkey` FOREIGN KEY (`ht_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_cm_member_id_fkey` FOREIGN KEY (`cm_member_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_cm_community_id_fkey` FOREIGN KEY (`cm_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
