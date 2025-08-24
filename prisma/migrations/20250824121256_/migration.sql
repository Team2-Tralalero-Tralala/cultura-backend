-- CreateTable
CREATE TABLE `roles` (
    `re_id` INTEGER NOT NULL AUTO_INCREMENT,
    `re_name` VARCHAR(45) NOT NULL,

    UNIQUE INDEX `roles_re_name_key`(`re_name`),
    PRIMARY KEY (`re_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `us_id` INTEGER NOT NULL AUTO_INCREMENT,
    `us_role_id` INTEGER NOT NULL,
    `us_username` VARCHAR(50) NOT NULL,
    `us_email` VARCHAR(65) NOT NULL,
    `us_password` VARCHAR(255) NOT NULL,
    `us_fname` VARCHAR(100) NOT NULL,
    `us_lname` VARCHAR(100) NOT NULL,
    `us_phone` VARCHAR(10) NOT NULL,
    `us_gender` ENUM('FEMALE', 'MALE', 'NONE') NULL,
    `us_birth_date` DATE NULL,
    `us_sub_district` VARCHAR(60) NULL,
    `us_district` VARCHAR(60) NULL,
    `us_province` VARCHAR(60) NULL,
    `us_postal_code` VARCHAR(5) NULL,
    `us_activity_role` VARCHAR(100) NULL,

    UNIQUE INDEX `users_us_username_key`(`us_username`),
    UNIQUE INDEX `users_us_email_key`(`us_email`),
    UNIQUE INDEX `users_us_phone_key`(`us_phone`),
    INDEX `fk_users_roles_idx`(`us_role_id`),
    PRIMARY KEY (`us_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `lt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lt_houseNumber` VARCHAR(10) NOT NULL,
    `lt_village_number` INTEGER NULL,
    `lt_alley` VARCHAR(60) NULL,
    `lt_sub_district` VARCHAR(60) NOT NULL,
    `lt_district` VARCHAR(60) NOT NULL,
    `lt_province` VARCHAR(60) NOT NULL,
    `lt_postal_code` VARCHAR(5) NOT NULL,
    `lt_latitude` DOUBLE NOT NULL,
    `lt_longitude` DOUBLE NOT NULL,

    PRIMARY KEY (`lt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communities` (
    `ct_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ct_location_id` INTEGER NOT NULL,
    `ct_name` VARCHAR(150) NOT NULL,
    `ct_alias` VARCHAR(100) NULL,
    `ct_type` VARCHAR(90) NOT NULL,
    `ct_register_number` VARCHAR(45) NOT NULL,
    `ct_register_date` DATE NOT NULL,
    `ct_description` VARCHAR(200) NOT NULL,
    `ct_main_activity_name` VARCHAR(80) NOT NULL,
    `ct_main_activity_description` VARCHAR(150) NOT NULL,
    `ct_status` ENUM('OPEN', 'CLOSED') NOT NULL,
    `ct_phone` VARCHAR(10) NOT NULL,
    `ct_rating` DOUBLE NOT NULL,
    `ct_email` VARCHAR(65) NOT NULL,
    `ct_bank` VARCHAR(100) NOT NULL,
    `ct_bank_account_name` VARCHAR(70) NOT NULL,
    `ct_bank_account_number` VARCHAR(20) NOT NULL,
    `ct_main_admin` VARCHAR(100) NULL,
    `ct_main_admin_phone` VARCHAR(10) NULL,
    `ct_coordinator_name` VARCHAR(150) NULL,
    `ct_coordinator_phone` VARCHAR(10) NULL,
    `ct_url_website` VARCHAR(2048) NULL,
    `ct_url_facebook` VARCHAR(2048) NULL,
    `ct_url_line` VARCHAR(2048) NULL,
    `ct_url_tiktok` VARCHAR(2048) NULL,
    `ct_url_other` VARCHAR(2048) NULL,

    UNIQUE INDEX `communities_ct_name_key`(`ct_name`),
    UNIQUE INDEX `communities_ct_register_number_key`(`ct_register_number`),
    UNIQUE INDEX `communities_ct_phone_key`(`ct_phone`),
    UNIQUE INDEX `communities_ct_email_key`(`ct_email`),
    INDEX `fk_communities_locations1_idx`(`ct_location_id`),
    PRIMARY KEY (`ct_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_members` (
    `cm_community_id` INTEGER NOT NULL,
    `cm_member_id` INTEGER NOT NULL,
    `cm_re_id` INTEGER NOT NULL,

    INDEX `fk_communities_has_users_users1_idx`(`cm_member_id`),
    INDEX `fk_communities_has_users_communities1_idx`(`cm_community_id`),
    INDEX `fk_community_members_roles1_idx`(`cm_re_id`),
    PRIMARY KEY (`cm_community_id`, `cm_member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `pk_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pk_community_id` INTEGER NOT NULL,
    `pk_location_id` INTEGER NOT NULL,
    `pk_overseer_member_id` INTEGER NOT NULL,
    `pk_name` VARCHAR(100) NOT NULL,
    `pk_description` VARCHAR(500) NOT NULL,
    `pk_capacity` INTEGER NOT NULL,
    `pk_price` DOUBLE NOT NULL,
    `pk_warning` VARCHAR(200) NOT NULL,
    `pk_status_package` ENUM('PUBLISH', 'UNPUBLISH', 'DRAFT') NOT NULL,
    `pk_status_approve` ENUM('WAIT', 'APPROVE') NULL,
    `pk_start_date` DATETIME NOT NULL,
    `pk_due_date` DATETIME NOT NULL,
    `pk_facility` VARCHAR(200) NOT NULL,

    INDEX `fk_packages_communities1_idx`(`pk_community_id`),
    INDEX `fk_packages_locations1_idx`(`pk_location_id`),
    INDEX `fk_packages_community_members1_idx`(`pk_overseer_member_id`, `pk_community_id`),
    PRIMARY KEY (`pk_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homestays` (
    `ht_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ht_name` VARCHAR(60) NOT NULL,
    `ht_room_type` VARCHAR(45) NOT NULL,
    `ht_capacity` INTEGER NOT NULL,

    PRIMARY KEY (`ht_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `st_id` INTEGER NOT NULL AUTO_INCREMENT,
    `st_name` VARCHAR(80) NOT NULL,
    `st_detail` VARCHAR(200) NOT NULL,
    `st_community_id` INTEGER NOT NULL,
    `st_location_id` INTEGER NOT NULL,

    INDEX `fk_restaurants_communities1_idx`(`st_community_id`),
    INDEX `fk_restaurants_locations1_idx`(`st_location_id`),
    PRIMARY KEY (`st_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_histories` (
    `bh_id` INTEGER NOT NULL,
    `bh_tourist_id` INTEGER NOT NULL,
    `bh_package_id` INTEGER NOT NULL,
    `bh_booking_at` TIMESTAMP(0) NOT NULL,
    `bh_cancel_at` TIMESTAMP(0) NULL,
    `bh_refund_at` TIMESTAMP(0) NULL,
    `bh_status` ENUM('PENDING', 'REFUND_PENDING', 'REFUNDED', 'BOOKED', 'CANCELLED') NULL,
    `bh_total_participant` INTEGER NOT NULL,
    `bh_reject_reason` VARCHAR(100) NULL,

    INDEX `fk_users_has_packages_packages1_idx`(`bh_package_id`),
    INDEX `fk_users_has_packages_users1_idx`(`bh_tourist_id`),
    PRIMARY KEY (`bh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedbacks` (
    `fb_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fb_booking_history_id` INTEGER NOT NULL,
    `fb_created_at` TIMESTAMP(0) NOT NULL,
    `fb_message` VARCHAR(200) NOT NULL,
    `fb_rating` DOUBLE NOT NULL,
    `fb_responder_id` INTEGER NULL,
    `fb_reply_time` TIMESTAMP(0) NULL,
    `fb_reply_message` VARCHAR(100) NULL,

    INDEX `fk_feedbacks_booking_histories1_idx`(`fb_booking_history_id`),
    INDEX `fk_feedbacks_users2_idx`(`fb_responder_id`),
    PRIMARY KEY (`fb_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `ps_id` INTEGER NOT NULL,
    `ps_name` VARCHAR(65) NOT NULL,

    PRIMARY KEY (`ps_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `tg_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tg_name` VARCHAR(90) NOT NULL,

    UNIQUE INDEX `tags_tg_name_key`(`tg_name`),
    PRIMARY KEY (`tg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homestay_histories` (
    `hh_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hh_package_id` INTEGER NOT NULL,
    `hh_homestay_id` INTEGER NOT NULL,
    `hh_guest_amount` INTEGER NOT NULL,
    `hh_check_in_time` DATETIME NOT NULL,
    `hh_check_out_time` DATETIME NOT NULL,
    `hh_status` ENUM('AVAILABLE', 'BOOKED') NOT NULL,

    INDEX `fk_packages_has_homestays_homestays1_idx`(`hh_homestay_id`),
    INDEX `fk_packages_has_homestays_packages1_idx`(`hh_package_id`),
    PRIMARY KEY (`hh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `lg_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lg_user_id` INTEGER NOT NULL,
    `lg_login_time` TIMESTAMP(0) NOT NULL,
    `lg_logout_time` TIMESTAMP(0) NULL,
    `lg_status` ENUM('SUCCESS', 'FAILED') NOT NULL,
    `lg_ip_address` VARCHAR(45) NOT NULL,

    INDEX `fk_logs_users1_idx`(`lg_user_id`),
    PRIMARY KEY (`lg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission_roles` (
    `psre_permission_id` INTEGER NOT NULL,
    `psre_role_id` INTEGER NOT NULL,

    INDEX `fk_permissions_has_roles_roles1_idx`(`psre_role_id`),
    INDEX `fk_permissions_has_roles_permissions1_idx`(`psre_permission_id`),
    PRIMARY KEY (`psre_permission_id`, `psre_role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag_homestays` (
    `tght_tag_id` INTEGER NOT NULL,
    `tght_homestay_id` INTEGER NOT NULL,

    INDEX `fk_tags_has_homestays_homestays1_idx`(`tght_homestay_id`),
    INDEX `fk_tags_has_homestays_tags1_idx`(`tght_tag_id`),
    PRIMARY KEY (`tght_tag_id`, `tght_homestay_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags_packages` (
    `tgpk_tag_id` INTEGER NOT NULL,
    `tgpk_package_id` INTEGER NOT NULL,

    INDEX `fk_tags_has_packages_packages1_idx`(`tgpk_package_id`),
    INDEX `fk_tags_has_packages_tags1_idx`(`tgpk_tag_id`),
    PRIMARY KEY (`tgpk_tag_id`, `tgpk_package_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag_stores` (
    `tgst_tag_id` INTEGER NOT NULL,
    `tgst_store_id` INTEGER NOT NULL,

    INDEX `fk_tags_has_restaurants_restaurants1_idx`(`tgst_store_id`),
    INDEX `fk_tags_has_restaurants_tags1_idx`(`tgst_tag_id`),
    PRIMARY KEY (`tgst_tag_id`, `tgst_store_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_roles` FOREIGN KEY (`us_role_id`) REFERENCES `roles`(`re_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communities` ADD CONSTRAINT `fk_communities_locations1` FOREIGN KEY (`ct_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `fk_communities_has_users_communities1` FOREIGN KEY (`cm_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `fk_communities_has_users_users1` FOREIGN KEY (`cm_member_id`) REFERENCES `users`(`us_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `fk_community_members_roles1` FOREIGN KEY (`cm_re_id`) REFERENCES `roles`(`re_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_communities1` FOREIGN KEY (`pk_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_locations1` FOREIGN KEY (`pk_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_community_members1` FOREIGN KEY (`pk_community_id`, `pk_overseer_member_id`) REFERENCES `community_members`(`cm_community_id`, `cm_member_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `fk_restaurants_communities1` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `fk_restaurants_locations1` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `booking_histories` ADD CONSTRAINT `fk_users_has_packages_users1` FOREIGN KEY (`bh_tourist_id`) REFERENCES `users`(`us_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `booking_histories` ADD CONSTRAINT `fk_users_has_packages_packages1` FOREIGN KEY (`bh_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `fk_feedbacks_booking_histories1` FOREIGN KEY (`fb_booking_history_id`) REFERENCES `booking_histories`(`bh_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `fk_feedbacks_users2` FOREIGN KEY (`fb_responder_id`) REFERENCES `users`(`us_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `homestay_histories` ADD CONSTRAINT `fk_packages_has_homestays_packages1` FOREIGN KEY (`hh_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `homestay_histories` ADD CONSTRAINT `fk_packages_has_homestays_homestays1` FOREIGN KEY (`hh_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `fk_logs_users1` FOREIGN KEY (`lg_user_id`) REFERENCES `users`(`us_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `permission_roles` ADD CONSTRAINT `fk_permissions_has_roles_permissions1` FOREIGN KEY (`psre_permission_id`) REFERENCES `permissions`(`ps_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `permission_roles` ADD CONSTRAINT `fk_permissions_has_roles_roles1` FOREIGN KEY (`psre_role_id`) REFERENCES `roles`(`re_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tag_homestays` ADD CONSTRAINT `fk_tags_has_homestays_tags1` FOREIGN KEY (`tght_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tag_homestays` ADD CONSTRAINT `fk_tags_has_homestays_homestays1` FOREIGN KEY (`tght_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tags_packages` ADD CONSTRAINT `fk_tags_has_packages_tags1` FOREIGN KEY (`tgpk_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tags_packages` ADD CONSTRAINT `fk_tags_has_packages_packages1` FOREIGN KEY (`tgpk_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tag_stores` ADD CONSTRAINT `fk_tags_has_restaurants_tags1` FOREIGN KEY (`tgst_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tag_stores` ADD CONSTRAINT `fk_tags_has_restaurants_restaurants1` FOREIGN KEY (`tgst_store_id`) REFERENCES `stores`(`st_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
