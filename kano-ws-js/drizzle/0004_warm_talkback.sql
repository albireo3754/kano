CREATE TABLE `messages` (
	`id` varchar(255) NOT NULL,
	`text` varchar(255) NOT NULL,
	`createdAt` int NOT NULL,
	`userId` int NOT NULL,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
