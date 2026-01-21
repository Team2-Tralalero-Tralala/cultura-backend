-- CreateTable
CREATE TABLE `banners` (
    `bn_id` INTEGER NOT NULL AUTO_INCREMENT,
    `bn_image` VARCHAR(256) NOT NULL,

    PRIMARY KEY (`bn_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_image` (
    `si_id` INTEGER NOT NULL AUTO_INCREMENT,
    `si_store_id` INTEGER NOT NULL,
    `si_image` VARCHAR(256) NOT NULL,
    `si_type` ENUM('COVER', 'GALLERY', 'VIDEO', 'LOGO') NOT NULL,

    INDEX `store_image_si_store_id_idx`(`si_store_id`),
    PRIMARY KEY (`si_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `st_id` INTEGER NOT NULL AUTO_INCREMENT,
    `st_name` VARCHAR(80) NOT NULL,
    `st_detail` VARCHAR(200) NOT NULL,
    `st_community_id` INTEGER NOT NULL,
    `st_location_id` INTEGER NOT NULL,
    `st_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `st_delete_at` TIMESTAMP(0) NULL,

    INDEX `stores_st_community_id_idx`(`st_community_id`),
    INDEX `stores_st_location_id_idx`(`st_location_id`),
    PRIMARY KEY (`st_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homestay_images` (
    `hi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hi_homestay_id` INTEGER NOT NULL,
    `hi_image` VARCHAR(256) NOT NULL,
    `hi_type` ENUM('COVER', 'GALLERY', 'VIDEO', 'LOGO') NOT NULL,

    INDEX `homestay_images_hi_homestay_id_idx`(`hi_homestay_id`),
    PRIMARY KEY (`hi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homestays` (
    `ht_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ht_community_id` INTEGER NOT NULL,
    `ht_location_id` INTEGER NOT NULL,
    `ht_name` VARCHAR(60) NOT NULL,
    `ht_room_type` VARCHAR(45) NOT NULL,
    `ht_guest_per_room` INTEGER NOT NULL,
    `ht_total_room` INTEGER NOT NULL,
    `ht_facility` VARCHAR(200) NOT NULL,
    `ht_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `ht_delete_at` TIMESTAMP(0) NULL,

    INDEX `homestays_ht_community_id_idx`(`ht_community_id`),
    INDEX `homestays_ht_location_id_idx`(`ht_location_id`),
    PRIMARY KEY (`ht_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_images` (
    `ci_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ci_commuinty_id` INTEGER NOT NULL,
    `ci_image` VARCHAR(256) NOT NULL,
    `ci_type` ENUM('COVER', 'GALLERY', 'VIDEO', 'LOGO') NOT NULL,

    INDEX `community_images_ci_commuinty_id_idx`(`ci_commuinty_id`),
    PRIMARY KEY (`ci_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communities` (
    `ct_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ct_location_id` INTEGER NOT NULL,
    `ct_admin_id` INTEGER NOT NULL,
    `ct_name` VARCHAR(150) NOT NULL,
    `ct_alias` VARCHAR(100) NULL,
    `ct_type` VARCHAR(90) NOT NULL,
    `ct_register_number` VARCHAR(45) NOT NULL,
    `ct_register_date` DATE NOT NULL,
    `ct_description` VARCHAR(200) NOT NULL,
    `ct_bank_name` VARCHAR(60) NOT NULL,
    `ct_account_name` VARCHAR(45) NOT NULL,
    `ct_account_number` VARCHAR(45) NOT NULL,
    `ct_main_activity_name` VARCHAR(80) NOT NULL,
    `ct_main_activity_description` VARCHAR(150) NOT NULL,
    `ct_status` ENUM('OPEN', 'CLOSED') NULL DEFAULT 'CLOSED',
    `ct_phone` VARCHAR(10) NOT NULL,
    `ct_rating` DOUBLE NOT NULL,
    `ct_is_rating_visible` BOOLEAN NOT NULL DEFAULT false,
    `ct_email` VARCHAR(65) NOT NULL,
    `ct_main_admin` VARCHAR(100) NOT NULL,
    `ct_main_admin_phone` VARCHAR(10) NOT NULL,
    `ct_coordinator_name` VARCHAR(150) NULL,
    `ct_coordinator_phone` VARCHAR(10) NULL,
    `ct_url_website` VARCHAR(2048) NULL,
    `ct_url_facebook` VARCHAR(2048) NULL,
    `ct_url_line` VARCHAR(2048) NULL,
    `ct_url_tiktok` VARCHAR(2048) NULL,
    `ct_url_other` VARCHAR(2048) NULL,
    `ct_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `ct_delete_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `communities_ct_name_key`(`ct_name`),
    UNIQUE INDEX `communities_ct_register_number_key`(`ct_register_number`),
    UNIQUE INDEX `communities_ct_phone_key`(`ct_phone`),
    UNIQUE INDEX `communities_ct_email_key`(`ct_email`),
    INDEX `communities_ct_location_id_idx`(`ct_location_id`),
    INDEX `communities_ct_admin_id_idx`(`ct_admin_id`),
    PRIMARY KEY (`ct_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_files` (
    `pf_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pf_package_id` INTEGER NOT NULL,
    `pf_image` VARCHAR(256) NOT NULL,
    `pf_type` ENUM('COVER', 'GALLERY', 'VIDEO', 'LOGO') NOT NULL,

    INDEX `package_files_pf_package_id_idx`(`pf_package_id`),
    PRIMARY KEY (`pf_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `pk_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pk_community_id` INTEGER NOT NULL,
    `pk_location_id` INTEGER NULL,
    `pk_overseer_member_id` INTEGER NULL,
    `pk_create_by` INTEGER NOT NULL,
    `pk_name` VARCHAR(100) NULL,
    `pk_description` VARCHAR(500) NULL,
    `pk_capacity` INTEGER NULL,
    `pk_price` DOUBLE NULL,
    `pk_warning` VARCHAR(200) NULL,
    `pk_status_package` ENUM('PUBLISH', 'UNPUBLISH', 'DRAFT') NOT NULL,
    `pk_status_approve` ENUM('PENDING', 'APPROVE', 'PENDING_SUPER', 'REJECTED') NULL,
    `pk_start_date` DATETIME NULL,
    `pk_due_date` DATETIME NULL,
    `pk_booking_open_date` DATETIME NULL,
    `pk_booking_close_date` DATETIME NULL,
    `pk_facility` VARCHAR(200) NULL,
    `pk_reject_reason` VARCHAR(100) NULL,
    `pk_created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `pk_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `pk_delete_at` TIMESTAMP(0) NULL,

    INDEX `packages_pk_community_id_idx`(`pk_community_id`),
    INDEX `packages_pk_location_id_idx`(`pk_location_id`),
    INDEX `packages_pk_create_by_idx`(`pk_create_by`),
    INDEX `packages_pk_overseer_member_id_idx`(`pk_overseer_member_id`),
    PRIMARY KEY (`pk_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `us_profile_image` VARCHAR(256) NULL,
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
    `us_status` ENUM('ACTIVE', 'BLOCKED') NULL DEFAULT 'ACTIVE',
    `us_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `us_delete_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `users_us_username_key`(`us_username`),
    UNIQUE INDEX `users_us_email_key`(`us_email`),
    UNIQUE INDEX `users_us_phone_key`(`us_phone`),
    INDEX `users_us_role_id_idx`(`us_role_id`),
    PRIMARY KEY (`us_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `prt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `prt_user_id` INTEGER NOT NULL,
    `prt_token_hash` CHAR(64) NOT NULL,
    `prt_created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `prt_expires_at` DATETIME(0) NOT NULL,
    `prt_used_at` DATETIME(0) NULL,

    UNIQUE INDEX `password_reset_tokens_prt_token_hash_key`(`prt_token_hash`),
    INDEX `password_reset_tokens_prt_user_id_idx`(`prt_user_id`),
    PRIMARY KEY (`prt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `feedback_images` (
    `fi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fi_feedback_id` INTEGER NOT NULL,
    `fi_image` VARCHAR(256) NOT NULL,

    INDEX `feedback_images_fi_feedback_id_idx`(`fi_feedback_id`),
    PRIMARY KEY (`fi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `lt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lt_detail` VARCHAR(100) NULL,
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
CREATE TABLE `booking_histories` (
    `bh_id` INTEGER NOT NULL AUTO_INCREMENT,
    `bh_tourist_id` INTEGER NOT NULL,
    `bh_package_id` INTEGER NULL,
    `bh_tourist_bank_account_id` INTEGER NULL,
    `bh_booking_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `bh_cancel_at` TIMESTAMP(0) NULL,
    `bh_refund_at` TIMESTAMP(0) NULL,
    `bh_status` ENUM('PENDING', 'BOOKED', 'REJECTED', 'REFUND_PENDING', 'REFUNDED', 'REFUND_REJECTED') NULL,
    `bh_is_participate` BOOLEAN NOT NULL DEFAULT false,
    `bh_total_participant` INTEGER NOT NULL,
    `bh_reject_reason` VARCHAR(100) NULL,
    `bh_refund_reason` VARCHAR(100) NULL,
    `bh_transfer_slip` VARCHAR(256) NULL,

    INDEX `booking_histories_bh_package_id_idx`(`bh_package_id`),
    INDEX `booking_histories_bh_tourist_id_idx`(`bh_tourist_id`),
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
    `fb_reply_at` TIMESTAMP(0) NULL,
    `fb_reply_message` VARCHAR(100) NULL,

    INDEX `feedbacks_fb_booking_history_id_idx`(`fb_booking_history_id`),
    INDEX `feedbacks_fb_responder_id_idx`(`fb_responder_id`),
    PRIMARY KEY (`fb_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `tg_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tg_name` VARCHAR(90) NOT NULL,
    `tg_is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `tg_delete_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `tags_tg_name_key`(`tg_name`),
    PRIMARY KEY (`tg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homestay_histories` (
    `hh_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hh_package_id` INTEGER NOT NULL,
    `hh_homestay_id` INTEGER NOT NULL,
    `hh_booked_room` INTEGER NOT NULL,
    `hh_check_in_time` DATETIME NOT NULL,
    `hh_check_out_time` DATETIME NOT NULL,

    INDEX `homestay_histories_hh_homestay_id_idx`(`hh_homestay_id`),
    INDEX `homestay_histories_hh_package_id_idx`(`hh_package_id`),
    PRIMARY KEY (`hh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `lg_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lg_user_id` INTEGER NOT NULL,
    `lg_login_at` TIMESTAMP(0) NULL,
    `lg_logout_at` TIMESTAMP(0) NULL,
    `lg_ip_address` VARCHAR(45) NOT NULL,

    INDEX `logs_lg_user_id_idx`(`lg_user_id`),
    PRIMARY KEY (`lg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag_homestays` (
    `tght_tag_id` INTEGER NOT NULL,
    `tght_homestay_id` INTEGER NOT NULL,

    INDEX `tag_homestays_tght_homestay_id_idx`(`tght_homestay_id`),
    INDEX `tag_homestays_tght_tag_id_idx`(`tght_tag_id`),
    PRIMARY KEY (`tght_tag_id`, `tght_homestay_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags_packages` (
    `tgpk_tag_id` INTEGER NOT NULL,
    `tgpk_package_id` INTEGER NOT NULL,

    INDEX `tags_packages_tgpk_package_id_idx`(`tgpk_package_id`),
    INDEX `tags_packages_tgpk_tag_id_idx`(`tgpk_tag_id`),
    PRIMARY KEY (`tgpk_tag_id`, `tgpk_package_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag_stores` (
    `tgst_tag_id` INTEGER NOT NULL,
    `tgst_store_id` INTEGER NOT NULL,

    INDEX `tag_stores_tgst_store_id_idx`(`tgst_store_id`),
    INDEX `tag_stores_tgst_tag_id_idx`(`tgst_tag_id`),
    PRIMARY KEY (`tgst_tag_id`, `tgst_store_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `store_image` ADD CONSTRAINT `store_image_si_store_id_fkey` FOREIGN KEY (`si_store_id`) REFERENCES `stores`(`st_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_community_id_fkey` FOREIGN KEY (`st_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_st_location_id_fkey` FOREIGN KEY (`st_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestay_images` ADD CONSTRAINT `homestay_images_hi_homestay_id_fkey` FOREIGN KEY (`hi_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `homestays_ht_community_id_fkey` FOREIGN KEY (`ht_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestays` ADD CONSTRAINT `homestays_ht_location_id_fkey` FOREIGN KEY (`ht_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_images` ADD CONSTRAINT `community_images_ci_commuinty_id_fkey` FOREIGN KEY (`ci_commuinty_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communities` ADD CONSTRAINT `communities_ct_location_id_fkey` FOREIGN KEY (`ct_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communities` ADD CONSTRAINT `communities_ct_admin_id_fkey` FOREIGN KEY (`ct_admin_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_files` ADD CONSTRAINT `package_files_pf_package_id_fkey` FOREIGN KEY (`pf_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_community_id_fkey` FOREIGN KEY (`pk_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_location_id_fkey` FOREIGN KEY (`pk_location_id`) REFERENCES `locations`(`lt_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_create_by_fkey` FOREIGN KEY (`pk_create_by`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pk_overseer_member_id_fkey` FOREIGN KEY (`pk_overseer_member_id`) REFERENCES `users`(`us_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_us_role_id_fkey` FOREIGN KEY (`us_role_id`) REFERENCES `roles`(`re_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_prt_user_id_fkey` FOREIGN KEY (`prt_user_id`) REFERENCES `users`(`us_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_cm_member_id_fkey` FOREIGN KEY (`cm_member_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_cm_community_id_fkey` FOREIGN KEY (`cm_community_id`) REFERENCES `communities`(`ct_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback_images` ADD CONSTRAINT `feedback_images_fi_feedback_id_fkey` FOREIGN KEY (`fi_feedback_id`) REFERENCES `feedbacks`(`fb_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_histories` ADD CONSTRAINT `booking_histories_bh_tourist_id_fkey` FOREIGN KEY (`bh_tourist_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_histories` ADD CONSTRAINT `booking_histories_bh_package_id_fkey` FOREIGN KEY (`bh_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_fb_booking_history_id_fkey` FOREIGN KEY (`fb_booking_history_id`) REFERENCES `booking_histories`(`bh_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_fb_responder_id_fkey` FOREIGN KEY (`fb_responder_id`) REFERENCES `users`(`us_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestay_histories` ADD CONSTRAINT `homestay_histories_hh_package_id_fkey` FOREIGN KEY (`hh_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homestay_histories` ADD CONSTRAINT `homestay_histories_hh_homestay_id_fkey` FOREIGN KEY (`hh_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_lg_user_id_fkey` FOREIGN KEY (`lg_user_id`) REFERENCES `users`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_homestays` ADD CONSTRAINT `tag_homestays_tght_tag_id_fkey` FOREIGN KEY (`tght_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_homestays` ADD CONSTRAINT `tag_homestays_tght_homestay_id_fkey` FOREIGN KEY (`tght_homestay_id`) REFERENCES `homestays`(`ht_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags_packages` ADD CONSTRAINT `tags_packages_tgpk_tag_id_fkey` FOREIGN KEY (`tgpk_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags_packages` ADD CONSTRAINT `tags_packages_tgpk_package_id_fkey` FOREIGN KEY (`tgpk_package_id`) REFERENCES `packages`(`pk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_stores` ADD CONSTRAINT `tag_stores_tgst_tag_id_fkey` FOREIGN KEY (`tgst_tag_id`) REFERENCES `tags`(`tg_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag_stores` ADD CONSTRAINT `tag_stores_tgst_store_id_fkey` FOREIGN KEY (`tgst_store_id`) REFERENCES `stores`(`st_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
