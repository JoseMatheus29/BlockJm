-- CreateTable
CREATE TABLE `certification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `documentHash` VARCHAR(191) NOT NULL,
    `txHash` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `certifier` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `certification_documentHash_key`(`documentHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
