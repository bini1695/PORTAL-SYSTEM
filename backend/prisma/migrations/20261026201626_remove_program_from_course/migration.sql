/*
  Warnings:

  - You are about to drop the column `program` on the `course` table. All the data in the column will be lost.
  - The values [REGISTRAR] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `course` DROP COLUMN `program`;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'BURSAR', 'STUDENT') NOT NULL DEFAULT 'STUDENT';
