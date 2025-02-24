RENAME TABLE `users_table` TO `users`;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` ADD PRIMARY KEY(`id`);