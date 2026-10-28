-- CreateTable
CREATE TABLE `GradeChangeRequest` (
    `id` VARCHAR(36) NOT NULL,
    `enrollmentId` VARCHAR(36) NOT NULL,
    `facultyId` VARCHAR(36) NOT NULL,
    `oldGrade` VARCHAR(2) NOT NULL,
    `newGrade` VARCHAR(2) NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedBy` VARCHAR(36) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GradeChangeRequest_enrollmentId_idx`(`enrollmentId`),
    INDEX `GradeChangeRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GradeChangeRequest` ADD CONSTRAINT `GradeChangeRequest_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `Enrollment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
