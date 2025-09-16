/*
  Warnings:

  - You are about to drop the column `fb_reply_time` on the `feedbacks` table. All the data in the column will be lost.
  - You are about to alter the column `hh_check_in_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `hh_check_out_time` on the `homestay_histories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `lg_login_time` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `lg_logout_time` on the `logs` table. All the data in the column will be lost.
  - You are about to alter the column `pk_start_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `pk_due_date` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Added the required column `st_community_id` to the `homestays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `st_location_id` to the `homestays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lg_login_at` to the `logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `booking_histories` DROP FOREIGN KEY `fk_users_has_packages_packages1`;

-- DropForeignKey
ALTER TABLE `booking_histories` DROP FOREIGN KEY `fk_users_has_packages_users1`;

-- DropForeignKey
ALTER TABLE `communities` DROP FOREIGN KEY `fk_communities_locations1`;

-- DropForeignKey
ALTER TABLE `community_members` DROP FOREIGN KEY `fk_communities_has_users_communities1`;

-- DropForeignKey
ALTER TABLE `community_members` DROP FOREIGN KEY `fk_communities_has_users_users1`;

-- DropForeignKey
ALTER TABLE `community_members` DROP FOREIGN KEY `fk_community_members_roles1`;

-- DropForeignKey
ALTER TABLE `feedbacks` DROP FOREIGN KEY `fk_feedbacks_booking_histories1`;

-- DropForeignKey
ALTER TABLE `feedbacks` DROP FOREIGN KEY `fk_feedbacks_users2`;

-- DropForeignKey
ALTER TABLE `homestay_histories` DROP FOREIGN KEY `fk_packages_has_homestays_homestays1`;

-- DropForeignKey
ALTER TABLE `homestay_histories` DROP FOREIGN KEY `fk_packages_has_homestays_packages1`;

-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `fk_logs_users1`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `fk_packages_communities1`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `fk_packages_community_members1`;

-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `fk_packages_locations1`;

-- DropForeignKey
ALTER TABLE `permission_roles` DROP FOREIGN KEY `fk_permissions_has_roles_permissions1`;

-- DropForeignKey
ALTER TABLE `permission_roles` DROP FOREIGN KEY `fk_permissions_has_roles_roles1`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `fk_restaurants_communities1`;

-- DropForeignKey
ALTER TABLE `stores` DROP FOREIGN KEY `fk_restaurants_locations1`;

-- DropForeignKey
ALTER TABLE `tag_homestays` DROP FOREIGN KEY `fk_tags_has_homestays_homestays1`;

-- DropForeignKey
ALTER TABLE `tag_homestays` DROP FOREIGN KEY `fk_tags_has_homestays_tags1`;

-- DropForeignKey
ALTER TABLE `tag_stores` DROP FOREIGN KEY `fk_tags_has_restaurants_restaurants1`;

-- DropForeignKey
ALTER TABLE `tag_stores` DROP FOREIGN KEY `fk_tags_has_restaurants_tags1`;

-- DropForeignKey
ALTER TABLE `tags_packages` DROP FOREIGN KEY `fk_tags_has_packages_packages1`;

-- DropForeignKey
ALTER TABLE `tags_packages` DROP FOREIGN KEY `fk_tags_has_packages_tags1`;

-- DropIndex
DROP INDEX `fk_packages_community_members1` ON `packages`;

-- AlterTable
ALTER TABLE `booking_histories` ALTER COLUMN `bh_booking_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `feedbacks` DROP COLUMN `fb_reply_time`,
    ADD COLUMN `fb_reply_at` TIMESTAMP(0) NULL,
    ALTER COLUMN `fb_created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `homestay_histories` MODIFY `hh_check_in_time` DATETIME NOT NULL,
    MODIFY `hh_check_out_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `homestays` ADD COLUMN `st_community_id` INTEGER NOT NULL,
    ADD COLUMN `st_location_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `logs` DROP COLUMN `lg_login_time`,
    DROP COLUMN `lg_logout_time`,
    ADD COLUMN `lg_login_at` TIMESTAMP(0) NOT NULL,
    ADD COLUMN `lg_logout_at` TIMESTAMP(0) NULL;

-- AlterTable
ALTER TABLE `packages` MODIFY `pk_start_date` DATETIME NOT NULL,
    MODIFY `pk_due_date` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `us_status` ENUM('ACTIVE', 'BLOCKED') NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE `communities` ADD CONSTRAINT `fk_communities_locations1` FOREIGN KEY (`ct_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `fk_community_members_communities1` FOREIGN KEY (`cm_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `fk_community_members_users1` FOREIGN KEY (`cm_member_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `fk_community_members_roles1` FOREIGN KEY (`cm_re_id`) REFERENCES `roles`(`re_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_communities1` FOREIGN KEY (`pk_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_locations1` FOREIGN KEY (`pk_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_community_members1` FOREIGN KEY (`pk_community_id`, `pk_overseer_member_id`) REFERENCES `community_members`(`cm_community_id`, `cm_member_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `fk_homestays_communities1` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `fk_homestays_locations1` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `fk_stores_communities1` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `fk_stores_locations1` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_histories` ADD CONSTRAINT `fk_users_has_packages_users1` FOREIGN KEY (`bh_tourist_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_histories` ADD CONSTRAINT `fk_users_has_packages_packages1` FOREIGN KEY (`bh_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `fk_feedbacks_booking_histories1` FOREIGN KEY (`fb_booking_history_id`) REFERENCES `booking_histories`(`bh_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `fk_feedbacks_users2` FOREIGN KEY (`fb_responder_id`) REFERENCES `users`(`us_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestay_histories` ADD CONSTRAINT `fk_homestay_histories_packages1` FOREIGN KEY (`hh_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestay_histories` ADD CONSTRAINT `fk_homestay_histories_homestays1` FOREIGN KEY (`hh_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `fk_logs_users1` FOREIGN KEY (`lg_user_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permission_roles` ADD CONSTRAINT `fk_permission_roles_permissions1` FOREIGN KEY (`psre_permission_id`) REFERENCES `permissions`(`ps_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permission_roles` ADD CONSTRAINT `fk_permission_roles_roles1` FOREIGN KEY (`psre_role_id`) REFERENCES `roles`(`re_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_homestays` ADD CONSTRAINT `fk_tag_homestays_tags1` FOREIGN KEY (`tght_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_homestays` ADD CONSTRAINT `fk_tag_homestays_homestays1` FOREIGN KEY (`tght_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags_packages` ADD CONSTRAINT `fk_tag_packages_tags1` FOREIGN KEY (`tgpk_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags_packages` ADD CONSTRAINT `fk_tag_packages_packages1` FOREIGN KEY (`tgpk_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_stores` ADD CONSTRAINT `fk_tag_stores_tags1` FOREIGN KEY (`tgst_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_stores` ADD CONSTRAINT `fk_tag_stores_stores1` FOREIGN KEY (`tgst_store_id`) REFERENCES `stores`(`st_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `fk_community_members_communities1_idx` ON `community_members`(`cm_community_id`);
DROP INDEX `fk_communities_has_users_communities1_idx` ON `community_members`;

-- RedefineIndex
CREATE INDEX `fk_community_members_users1_idx` ON `community_members`(`cm_member_id`);
DROP INDEX `fk_communities_has_users_users1_idx` ON `community_members`;

-- RedefineIndex
CREATE INDEX `fk_homestay_histories_homestays1_idx` ON `homestay_histories`(`hh_homestay_id`);
DROP INDEX `fk_packages_has_homestays_homestays1_idx` ON `homestay_histories`;

-- RedefineIndex
CREATE INDEX `fk_homestay_histories_packages1_idx` ON `homestay_histories`(`hh_package_id`);
DROP INDEX `fk_packages_has_homestays_packages1_idx` ON `homestay_histories`;

-- RedefineIndex
CREATE INDEX `fk_permission_roles_permissions1_idx` ON `permission_roles`(`psre_permission_id`);
DROP INDEX `fk_permissions_has_roles_permissions1_idx` ON `permission_roles`;

-- RedefineIndex
CREATE INDEX `fk_permission_roles_roles1_idx` ON `permission_roles`(`psre_role_id`);
DROP INDEX `fk_permissions_has_roles_roles1_idx` ON `permission_roles`;

-- RedefineIndex
CREATE INDEX `fk_stores_communities1_idx` ON `stores`(`st_community_id`);
DROP INDEX `fk_restaurants_communities1_idx` ON `stores`;

-- RedefineIndex
CREATE INDEX `fk_stores_locations1_idx` ON `stores`(`st_location_id`);
DROP INDEX `fk_restaurants_locations1_idx` ON `stores`;

-- RedefineIndex
CREATE INDEX `fk_tag_homestays_homestays1_idx` ON `tag_homestays`(`tght_homestay_id`);
DROP INDEX `fk_tags_has_homestays_homestays1_idx` ON `tag_homestays`;

-- RedefineIndex
CREATE INDEX `fk_tag_homestays_tags1_idx` ON `tag_homestays`(`tght_tag_id`);
DROP INDEX `fk_tags_has_homestays_tags1_idx` ON `tag_homestays`;

-- RedefineIndex
CREATE INDEX `fk_tag_stores_stores1_idx` ON `tag_stores`(`tgst_store_id`);
DROP INDEX `fk_tags_has_restaurants_restaurants1_idx` ON `tag_stores`;

-- RedefineIndex
CREATE INDEX `fk_tag_stores_tags1_idx` ON `tag_stores`(`tgst_tag_id`);
DROP INDEX `fk_tags_has_restaurants_tags1_idx` ON `tag_stores`;

-- RedefineIndex
CREATE INDEX `fk_tag_packages_packages1_idx` ON `tags_packages`(`tgpk_package_id`);
DROP INDEX `fk_tags_has_packages_packages1_idx` ON `tags_packages`;

-- RedefineIndex
CREATE INDEX `fk_tag_packages_tags1_idx` ON `tags_packages`(`tgpk_tag_id`);
DROP INDEX `fk_tags_has_packages_tags1_idx` ON `tags_packages`;
