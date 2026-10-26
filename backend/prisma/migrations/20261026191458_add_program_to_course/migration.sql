-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'REGISTRAR', 'FACULTY', 'BURSAR', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    `accountStatus` ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING',
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_accountStatus_idx`(`accountStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `firstName` VARCHAR(60) NOT NULL,
    `lastName` VARCHAR(60) NOT NULL,
    `phone` VARCHAR(40) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `address` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Profile_userId_key`(`userId`),
    INDEX `Profile_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `studentNumber` VARCHAR(32) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING',
    `program` VARCHAR(120) NOT NULL,
    `degreeLevel` ENUM('CERTIFICATE', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTORATE') NOT NULL,
    `admittedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Student_userId_key`(`userId`),
    UNIQUE INDEX `Student_studentNumber_key`(`studentNumber`),
    INDEX `Student_userId_idx`(`userId`),
    INDEX `Student_studentNumber_idx`(`studentNumber`),
    INDEX `Student_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faculty` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `employeeNo` VARCHAR(32) NOT NULL,
    `department` VARCHAR(120) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Faculty_userId_key`(`userId`),
    UNIQUE INDEX `Faculty_employeeNo_key`(`employeeNo`),
    INDEX `Faculty_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(36) NOT NULL,
    `studentId` VARCHAR(36) NOT NULL,
    `type` ENUM('ID_CARD', 'TRANSCRIPT', 'PROOF_OF_ADDRESS', 'IMMUNIZATION', 'FINANCIAL_AID', 'OTHER') NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewerId` VARCHAR(36) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `note` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Document_studentId_idx`(`studentId`),
    INDEX `Document_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(16) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `description` VARCHAR(1000) NULL,
    `creditUnits` INTEGER NOT NULL,
    `degreeLevel` ENUM('CERTIFICATE', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTORATE') NOT NULL,
    `program` VARCHAR(120) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Course_code_key`(`code`),
    INDEX `Course_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prerequisite` (
    `id` VARCHAR(36) NOT NULL,
    `courseId` VARCHAR(36) NOT NULL,
    `prerequisiteId` VARCHAR(36) NOT NULL,
    `minimumGrade` VARCHAR(2) NOT NULL DEFAULT 'D',

    INDEX `Prerequisite_courseId_idx`(`courseId`),
    INDEX `Prerequisite_prerequisiteId_idx`(`prerequisiteId`),
    UNIQUE INDEX `Prerequisite_courseId_prerequisiteId_key`(`courseId`, `prerequisiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Section` (
    `id` VARCHAR(36) NOT NULL,
    `courseId` VARCHAR(36) NOT NULL,
    `instructorId` VARCHAR(36) NULL,
    `term` ENUM('FALL', 'SPRING', 'SUMMER', 'WINTER') NOT NULL,
    `academicYear` VARCHAR(9) NOT NULL,
    `sectionCode` VARCHAR(8) NOT NULL,
    `room` VARCHAR(40) NULL,
    `capacity` INTEGER NOT NULL,
    `enrolledCount` INTEGER NOT NULL DEFAULT 0,
    `waitlistCount` INTEGER NOT NULL DEFAULT 0,
    `schedule` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Section_courseId_idx`(`courseId`),
    INDEX `Section_instructorId_idx`(`instructorId`),
    INDEX `Section_term_academicYear_idx`(`term`, `academicYear`),
    UNIQUE INDEX `Section_courseId_term_academicYear_sectionCode_key`(`courseId`, `term`, `academicYear`, `sectionCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` VARCHAR(36) NOT NULL,
    `studentId` VARCHAR(36) NOT NULL,
    `sectionId` VARCHAR(36) NOT NULL,
    `status` ENUM('ENROLLED', 'WAITLISTED', 'DROPPED', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'ENROLLED',
    `grade` VARCHAR(2) NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `droppedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Enrollment_studentId_idx`(`studentId`),
    INDEX `Enrollment_sectionId_idx`(`sectionId`),
    INDEX `Enrollment_status_idx`(`status`),
    UNIQUE INDEX `Enrollment_studentId_sectionId_key`(`studentId`, `sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hold` (
    `id` VARCHAR(36) NOT NULL,
    `studentId` VARCHAR(36) NOT NULL,
    `type` ENUM('FINANCIAL', 'ACADEMIC', 'ADMINISTRATIVE') NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,

    INDEX `Hold_studentId_idx`(`studentId`),
    INDEX `Hold_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(36) NOT NULL,
    `studentId` VARCHAR(36) NOT NULL,
    `number` VARCHAR(64) NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID') NOT NULL DEFAULT 'ISSUED',
    `dueDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_number_key`(`number`),
    INDEX `Invoice_studentId_idx`(`studentId`),
    INDEX `Invoice_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(36) NOT NULL,
    `invoiceId` VARCHAR(36) NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(80) NULL,
    `method` VARCHAR(40) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_transactionId_key`(`transactionId`),
    INDEX `Payment_invoiceId_idx`(`invoiceId`),
    INDEX `Payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Announcement` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `authorId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Announcement_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NULL,
    `action` VARCHAR(80) NOT NULL,
    `entity` VARCHAR(80) NOT NULL,
    `entityId` VARCHAR(64) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(36) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Setting_key_key`(`key`),
    INDEX `Setting_key_idx`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Faculty` ADD CONSTRAINT `Faculty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prerequisite` ADD CONSTRAINT `Prerequisite_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prerequisite` ADD CONSTRAINT `Prerequisite_prerequisiteId_fkey` FOREIGN KEY (`prerequisiteId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `Faculty`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hold` ADD CONSTRAINT `Hold_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
