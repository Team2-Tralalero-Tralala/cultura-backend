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

-- AddForeignKey
ALTER TABLE `password_reset_tokens`
ADD CONSTRAINT `password_reset_tokens_prt_user_id_fkey`
FOREIGN KEY (`prt_user_id`) REFERENCES `users`(`us_id`) ON DELETE CASCADE ON UPDATE CASCADE;


