/*
  Warnings:

  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[lt_houseNumber,lt_village_number,lt_alley,lt_sub_district,lt_district,lt_province,lt_postal_code,lt_detail,lt_latitude,lt_longitude]` on the table `locations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `homestays` DROP FOREIGN KEY `fk_homestays_communities1`;

-- DropForeignKey
ALTER TABLE `homestays` DROP FOREIGN KEY `fk_homestays_locations1`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `fk_packages_communities1`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `fk_packages_locations1`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `fk_stores_communities1`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `fk_stores_locations1`;

-- DropIndex
DROP INDEX `fk_homestays_communities1` ON `homestays`;

-- DropIndex
DROP INDEX `fk_homestays_locations1` ON `homestays`;

-- AlterTable
ALTER TABLE `booking_histories` ALTER COLUMN `bh_booking_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `feedbacks` ALTER COLUMN `fb_created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `homestay_histories` MODIFY `hh_check_in_time` DATETIME NOT NULL,
    MODIFY `hh_check_out_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `locations` ADD COLUMN `lt_detail` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `logs` ALTER COLUMN `lg_login_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `packages` MODIFY `pk_start_date` DATETIME NOT NULL,
    MODIFY `pk_due_date` DATETIME NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `locations_lt_houseNumber_lt_village_number_lt_alley_lt_sub_d_key` ON `locations`(`lt_houseNumber`, `lt_village_number`, `lt_alley`, `lt_sub_district`, `lt_district`, `lt_province`, `lt_postal_code`, `lt_detail`, `lt_latitude`, `lt_longitude`);

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_communities1` FOREIGN KEY (`pk_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_locations1` FOREIGN KEY (`pk_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `fk_homestays_communities1` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `fk_homestays_locations1` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `fk_stores_communities1` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `fk_stores_locations1` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE CASCADE ON UPDATE CASCADE;
