CREATE TABLE `messages` (
	`id` varchar(255) NOT NULL,
	`conversationId` varchar(255) NOT NULL,
	`text` varchar(255) NOT NULL,
	`createdAt` int NOT NULL,
	`userId` int NOT NULL,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int NOT NULL,
	`email` varchar(255) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `conversation_id_idx` ON `messages` (`conversationId`);