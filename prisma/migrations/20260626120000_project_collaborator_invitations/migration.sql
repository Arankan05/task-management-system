-- User account onboarding fields
ALTER TABLE `User` ADD COLUMN `isTemporaryPassword` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `User` ADD COLUMN `passwordChangedAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `accountStatus` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';

-- Rename temp password expiry column (skip if already renamed)
ALTER TABLE `User` CHANGE `tempPasswordExpiresAt` `temporaryPasswordExpiresAt` DATETIME(3) NULL;

UPDATE `User`
SET `isTemporaryPassword` = true,
    `accountStatus` = 'PENDING_PASSWORD_CHANGE'
WHERE `mustResetPassword` = true;

-- Project collaborator invitations
CREATE TABLE IF NOT EXISTS `ProjectInvitation` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'COLLABORATOR',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `invitedById` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProjectInvitation_projectId_status_idx`(`projectId`, `status`),
    INDEX `ProjectInvitation_userId_idx`(`userId`),
    INDEX `ProjectInvitation_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ProjectInvitation` ADD CONSTRAINT `ProjectInvitation_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ProjectInvitation` ADD CONSTRAINT `ProjectInvitation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ProjectInvitation` ADD CONSTRAINT `ProjectInvitation_invitedById_fkey` FOREIGN KEY (`invitedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
