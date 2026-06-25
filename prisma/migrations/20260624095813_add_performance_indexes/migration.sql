-- CreateIndex
CREATE INDEX `Task_status_idx` ON `Task`(`status`);

-- CreateIndex
CREATE INDEX `Task_priority_idx` ON `Task`(`priority`);

-- CreateIndex
CREATE INDEX `WorkspaceMember_workspaceId_idx` ON `WorkspaceMember`(`workspaceId`);

-- RenameIndex
ALTER TABLE `attachment` RENAME INDEX `Attachment_taskId_fkey` TO `Attachment_taskId_idx`;

-- RenameIndex
ALTER TABLE `comment` RENAME INDEX `Comment_taskId_fkey` TO `Comment_taskId_idx`;

-- RenameIndex
ALTER TABLE `comment` RENAME INDEX `Comment_userId_fkey` TO `Comment_userId_idx`;

-- RenameIndex
ALTER TABLE `project` RENAME INDEX `Project_createdById_fkey` TO `Project_createdById_idx`;

-- RenameIndex
ALTER TABLE `project` RENAME INDEX `Project_workspaceId_fkey` TO `Project_workspaceId_idx`;

-- RenameIndex
ALTER TABLE `task` RENAME INDEX `Task_assignedToId_fkey` TO `Task_assignedToId_idx`;

-- RenameIndex
ALTER TABLE `task` RENAME INDEX `Task_createdById_fkey` TO `Task_createdById_idx`;

-- RenameIndex
ALTER TABLE `task` RENAME INDEX `Task_projectId_fkey` TO `Task_projectId_idx`;

-- RenameIndex
ALTER TABLE `workspace` RENAME INDEX `Workspace_ownerId_fkey` TO `Workspace_ownerId_idx`;

-- RenameIndex
ALTER TABLE `workspacemember` RENAME INDEX `WorkspaceMember_userId_fkey` TO `WorkspaceMember_userId_idx`;
