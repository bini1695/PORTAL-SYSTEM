-- AlterTable
ALTER TABLE `enrollment` ADD COLUMN `gradeSubmitted` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Assessment` (
    `id` VARCHAR(36) NOT NULL,
    `sectionId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('QUIZ', 'ASSIGNMENT', 'MID_EXAM', 'FINAL_EXAM', 'PROJECT') NOT NULL,
    `weight` DOUBLE NOT NULL,
    `totalMarks` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Assessment_sectionId_idx`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentMark` (
    `id` VARCHAR(36) NOT NULL,
    `assessmentId` VARCHAR(36) NOT NULL,
    `enrollmentId` VARCHAR(36) NOT NULL,
    `score` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentMark_assessmentId_idx`(`assessmentId`),
    INDEX `StudentMark_enrollmentId_idx`(`enrollmentId`),
    UNIQUE INDEX `StudentMark_assessmentId_enrollmentId_key`(`assessmentId`, `enrollmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentMark` ADD CONSTRAINT `StudentMark_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentMark` ADD CONSTRAINT `StudentMark_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `Enrollment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
