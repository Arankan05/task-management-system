-- CreateTable
CREATE TABLE `ProjectMember` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'COLLABORATOR',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProjectMember_userId_idx`(`userId`),
    INDEX `ProjectMember_projectId_idx`(`projectId`),
    UNIQUE INDEX `ProjectMember_projectId_userId_key`(`projectId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: add workspace members to each project with mapped roles
INSERT INTO `ProjectMember` (`id`, `projectId`, `userId`, `role`, `joinedAt`)
SELECT
    UUID(),
    p.id,
    wm.userId,
    CASE
        WHEN wm.role IN ('ADMINISTRATOR', 'OWNER', 'PROJECT_MANAGER') THEN 'PROJECT_MANAGER'
        ELSE 'COLLABORATOR'
    END,
    NOW(3)
FROM `Project` p
INNER JOIN `WorkspaceMember` wm ON wm.workspaceId = p.workspaceId
WHERE NOT EXISTS (
    SELECT 1 FROM `ProjectMember` pm
    WHERE pm.projectId = p.id AND pm.userId = wm.userId
);

-- Rename legacy default projects for visibility in project list
UPDATE `Project`
SET `name` = 'General', `description` = 'Migrated workspace tasks'
WHERE `name` = '__workspace_default__';
