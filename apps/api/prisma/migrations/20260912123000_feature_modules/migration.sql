-- Cambios acumulados después de la migración inicial. Esta migración es segura
-- para instalaciones nuevas que hayan aplicado únicamente la migración init.
ALTER TABLE `Wedding`
  ADD COLUMN `ceremonyVenue` VARCHAR(191) NULL,
  ADD COLUMN `receptionVenue` VARCHAR(191) NULL,
  ADD COLUMN `coverImageUrl` VARCHAR(191) NULL,
  ADD COLUMN `coverSubtitle` VARCHAR(191) NULL,
  ADD COLUMN `dressCode` VARCHAR(191) NULL,
  ADD COLUMN `program` TEXT NULL,
  ADD COLUMN `giftsInfo` TEXT NULL,
  ADD COLUMN `galleryUrl` VARCHAR(191) NULL,
  ADD COLUMN `galleryUrls` TEXT NULL,
  ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `clientId` VARCHAR(191) NULL;

CREATE TABLE `Client` (
  `id` VARCHAR(191) NOT NULL,
  `partnerOneName` VARCHAR(191) NOT NULL,
  `partnerTwoName` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `estimatedGuests` INTEGER NULL,
  `estimatedBudget` DECIMAL(12,2) NULL,
  `style` VARCHAR(191) NULL,
  `preferences` TEXT NULL,
  `internalNotes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Client_email_idx`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Wedding` ADD UNIQUE INDEX `Wedding_clientId_key`(`clientId`);
ALTER TABLE `Wedding` ADD CONSTRAINT `Wedding_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `Activity` (
  `id` VARCHAR(191) NOT NULL, `weddingId` VARCHAR(191) NOT NULL, `title` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL, `startsAt` DATETIME(3) NOT NULL, `endsAt` DATETIME(3) NULL,
  `responsible` VARCHAR(191) NULL, `notes` TEXT NULL,
  INDEX `Activity_weddingId_startsAt_idx`(`weddingId`,`startsAt`), PRIMARY KEY (`id`),
  CONSTRAINT `Activity_weddingId_fkey` FOREIGN KEY (`weddingId`) REFERENCES `Wedding`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FileRecord` (
  `id` VARCHAR(191) NOT NULL, `weddingId` VARCHAR(191) NOT NULL, `taskId` VARCHAR(191) NULL, `contractId` VARCHAR(191) NULL,
  `name` VARCHAR(191) NOT NULL, `mimeType` VARCHAR(191) NOT NULL, `path` VARCHAR(191) NOT NULL,
  `visibility` VARCHAR(191) NOT NULL DEFAULT 'INTERNAL', `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `FileRecord_weddingId_visibility_idx`(`weddingId`,`visibility`), INDEX `FileRecord_weddingId_taskId_idx`(`weddingId`,`taskId`), INDEX `FileRecord_contractId_idx`(`contractId`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TaskComment` (
  `id` VARCHAR(191) NOT NULL, `taskId` VARCHAR(191) NOT NULL, `authorId` VARCHAR(191) NOT NULL, `body` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX `TaskComment_taskId_createdAt_idx`(`taskId`,`createdAt`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Vendor` (
  `id` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, `category` VARCHAR(191) NOT NULL, `contactName` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL, `email` VARCHAR(191) NULL, `services` TEXT NULL, `priceRange` VARCHAR(191) NULL, `rating` INTEGER NULL,
  `internalNotes` TEXT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX `Vendor_category_name_idx`(`category`,`name`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VendorContract` (
  `id` VARCHAR(191) NOT NULL, `weddingId` VARCHAR(191) NOT NULL, `vendorId` VARCHAR(191) NOT NULL, `service` VARCHAR(191) NOT NULL,
  `quotedAmount` DECIMAL(12,2) NULL, `contractedAmount` DECIMAL(12,2) NULL, `paidAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'MXN', `conditions` TEXT NULL, `quoteDetails` TEXT NULL, `contractReference` VARCHAR(191) NULL,
  `status` ENUM('DRAFT','QUOTED','CONTRACTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT', `signedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  INDEX `VendorContract_weddingId_status_idx`(`weddingId`,`status`), INDEX `VendorContract_vendorId_idx`(`vendorId`), PRIMARY KEY (`id`),
  CONSTRAINT `VendorContract_weddingId_fkey` FOREIGN KEY (`weddingId`) REFERENCES `Wedding`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VendorContract_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VendorContractPayment` (
  `id` VARCHAR(191) NOT NULL, `contractId` VARCHAR(191) NOT NULL, `amount` DECIMAL(12,2) NOT NULL, `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reference` VARCHAR(191) NULL, `notes` TEXT NULL, INDEX `VendorContractPayment_contractId_paidAt_idx`(`contractId`,`paidAt`), PRIMARY KEY (`id`),
  CONSTRAINT `VendorContractPayment_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `VendorContract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `FileRecord` ADD CONSTRAINT `FileRecord_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `VendorContract`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
