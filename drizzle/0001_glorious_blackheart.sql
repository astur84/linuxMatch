CREATE TABLE `distros` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text NOT NULL DEFAULT (''),
	`category` varchar(64) NOT NULL DEFAULT 'General',
	`ramMin` int NOT NULL DEFAULT 512,
	`difficulty` enum('Principiante','Intermedio','Avanzado') NOT NULL DEFAULT 'Principiante',
	`purpose` enum('General','Gaming','Servidores','Seguridad','PCs Antiguos') NOT NULL DEFAULT 'General',
	`architecture` enum('64-bit','ARM64','32-bit') NOT NULL DEFAULT '64-bit',
	`logoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distros_id` PRIMARY KEY(`id`)
);
