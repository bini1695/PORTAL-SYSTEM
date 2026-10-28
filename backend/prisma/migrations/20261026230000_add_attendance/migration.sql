-- CreateTable
CREATE TABLE `Attendance` (
    `id` VARCHAR(36) NOT NULL,
    `enrollmentId` VARCHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Attendance_enrollmentId_idx`(`enrollmentId`),
    UNIQUE INDEX `Attendance_enrollmentId_date_key`(`enrollmentId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `Enrollment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
