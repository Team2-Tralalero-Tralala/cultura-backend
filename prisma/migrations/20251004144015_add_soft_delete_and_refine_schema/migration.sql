/*
  Warnings:

  - You are about to drop the column `ct_bank` on the `communities` table. All the data in the column will be lost.
  - You are about to drop the column `ct_bank_account_name` on the `communities` table. All the data in the column will be lost.
  - You are about to drop the column `ct_bank_account_number` on the `communities` table. All the data in the column will be lost.
  - You are about to drop the column `hh_guest_amount` on the `homestay_histories` table. All the data in the column will be lost.
  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `ht_capacity` on the `homestays` table. All the data in the column will be lost.
  - You are about to drop the column `ht_detail` on the `homestays` table. All the data in the column will be lost.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the `bank_accounts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ct_account_name` to the `communities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ct_account_number` to the `communities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ct_bank_name` to the `communities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hh_booked_room` to the `homestay_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ht_facility` to the `homestays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ht_guest_per_room` to the `homestays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ht_total_room` to the `homestays` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `booking_histories` DROP FOREIGN KEY `booking_histories_bh_tourist_bank_account_id_fkey`;

-- DropForeignKey
ALTER TABLE `communities` DROP FOREIGN KEY `communities_ct_bank_account_id_fkey`;

-- DropForeignKey
ALTER TABLE `community_images` DROP FOREIGN KEY `community_images_ci_commuinty_id_fkey`;

-- DropForeignKey
ALTER TABLE `feedback_images` DROP FOREIGN KEY `feedback_images_fi_feedback_id_fkey`;

-- DropForeignKey
ALTER TABLE `homestay_images` DROP FOREIGN KEY `homestay_images_hi_homestay_id_fkey`;

-- DropForeignKey
ALTER TABLE `homestays` DROP FOREIGN KEY `homestays_st_community_id_fkey`;

-- DropForeignKey
ALTER TABLE `homestays` DROP FOREIGN KEY `homestays_st_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `package_files` DROP FOREIGN KEY `package_files_pf_package_id_fkey`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `packages_pk_community_id_fkey`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `packages_pk_create_by_fkey`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `packages_pk_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `store_image` DROP FOREIGN KEY `store_image_si_store_id_fkey`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_st_community_id_fkey`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `stores_st_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `tag_homestays` DROP FOREIGN KEY `tag_homestays_tght_homestay_id_fkey`;

-- DropForeignKey
ALTER TABLE `tag_stores` DROP FOREIGN KEY `tag_stores_tgst_store_id_fkey`;

-- DropForeignKey
ALTER TABLE `tags_packages` DROP FOREIGN KEY `tags_packages_tgpk_package_id_fkey`;

-- DropIndex
DROP INDEX `booking_histories_bh_tourist_bank_account_id_fkey` ON `booking_histories`;

-- AlterTable
ALTER TABLE `booking_histories` ALTER COLUMN `bh_booking_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `communities` DROP COLUMN `ct_bank`,
    DROP COLUMN `ct_bank_account_name`,
    DROP COLUMN `ct_bank_account_number`,
    ADD COLUMN `ct_account_name` VARCHAR(45) NOT NULL,
    ADD COLUMN `ct_account_number` VARCHAR(45) NOT NULL,
    ADD COLUMN `ct_bank_name` VARCHAR(60) NOT NULL,
    ADD COLUMN `ct_delete_at` TIMESTAMP(0) NULL,
    ADD COLUMN `ct_is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `feedbacks` ALTER COLUMN `fb_created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `homestay_histories` DROP COLUMN `hh_guest_amount`,
    ADD COLUMN `hh_booked_room` INTEGER NOT NULL,
    MODIFY `hh_check_in_time` DATETIME NOT NULL,
    MODIFY `hh_check_out_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `homestays` DROP COLUMN `ht_capacity`,
    DROP COLUMN `ht_detail`,
    ADD COLUMN `ht_delete_at` TIMESTAMP(0) NULL,
    ADD COLUMN `ht_facility` VARCHAR(200) NOT NULL,
    ADD COLUMN `ht_guest_per_room` INTEGER NOT NULL,
    ADD COLUMN `ht_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ht_total_room` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `packages` ADD COLUMN `pk_delete_at` TIMESTAMP(0) NULL,
    ADD COLUMN `pk_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `pk_start_date` DATETIME NOT NULL,
    MODIFY `pk_due_date` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `stores` ADD COLUMN `st_delete_at` TIMESTAMP(0) NULL,
    ADD COLUMN `st_is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `tags` ADD COLUMN `tg_delete_at` TIMESTAMP(0) NULL,
    ADD COLUMN `tg_is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `us_delete_at` TIMESTAMP(0) NULL,
    ADD COLUMN `us_is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `bank_accounts`;

-- AddForeignKey
ALTER TABLE `store_image` ADD CONSTRAINT `store_image_si_store_id_fkey` FOREIGN KEY (`si_store_id`) REFERENCES `stores`(`st_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_community_id_fkey` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_location_id_fkey` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestay_images` ADD CONSTRAINT `homestay_images_hi_homestay_id_fkey` FOREIGN KEY (`hi_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `homestays_st_community_id_fkey` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `homestays_st_location_id_fkey` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_images` ADD CONSTRAINT `community_images_ci_commuinty_id_fkey` FOREIGN KEY (`ci_commuinty_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_files` ADD CONSTRAINT `package_files_pf_package_id_fkey` FOREIGN KEY (`pf_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_community_id_fkey` FOREIGN KEY (`pk_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_location_id_fkey` FOREIGN KEY (`pk_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_create_by_fkey` FOREIGN KEY (`pk_create_by`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback_images` ADD CONSTRAINT `feedback_images_fi_feedback_id_fkey` FOREIGN KEY (`fi_feedback_id`) REFERENCES `feedbacks`(`fb_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_homestays` ADD CONSTRAINT `tag_homestays_tght_homestay_id_fkey` FOREIGN KEY (`tght_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags_packages` ADD CONSTRAINT `tags_packages_tgpk_package_id_fkey` FOREIGN KEY (`tgpk_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_stores` ADD CONSTRAINT `tag_stores_tgst_store_id_fkey` FOREIGN KEY (`tgst_store_id`) REFERENCES `stores`(`st_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
