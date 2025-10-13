/*
  Warnings:

  - You are about to drop the column `ct_bank_account_id` on the `communities` table. All the data in the column will be lost.
  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_st_community_id_fkey`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_st_location_id_fkey`;

-- DropIndex
DROP INDEX `communities_ct_bank_account_id_idx` ON `communities`;

-- DropIndex
DROP INDEX `communities_ct_bank_account_id_key` ON `communities`;

-- AlterTable
ALTER TABLE `booking_histories` ALTER COLUMN `bh_booking_at` DROP DEFAULT;

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

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_community_id_fkey` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_location_id_fkey` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE CASCADE ON UPDATE CASCADE;
