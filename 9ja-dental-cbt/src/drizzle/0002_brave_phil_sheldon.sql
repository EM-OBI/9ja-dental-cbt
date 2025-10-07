CREATE TABLE `flashcards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`topic_slug` text NOT NULL,
	`file_path` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`summary_id` text,
	`model` text DEFAULT 'gpt-5-codex' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`summary_id`) REFERENCES `summaries`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `flashcards_user_topic_idx` ON `flashcards` (`user_id`,`topic_slug`);--> statement-breakpoint
CREATE TABLE `study_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`topic_slug` text NOT NULL,
	`summary_done` integer DEFAULT false NOT NULL,
	`flashcards_done` integer DEFAULT false NOT NULL,
	`quiz_score` integer DEFAULT 0,
	`last_generated_at` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_progress_user_topic_idx` ON `study_progress` (`user_id`,`topic_slug`);--> statement-breakpoint
CREATE TABLE `study_quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`topic_slug` text NOT NULL,
	`file_path` text NOT NULL,
	`num_questions` integer DEFAULT 0 NOT NULL,
	`flashcard_id` text,
	`model` text DEFAULT 'gpt-5-codex' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_quizzes_user_topic_idx` ON `study_quizzes` (`user_id`,`topic_slug`);--> statement-breakpoint
CREATE TABLE `summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`topic_slug` text NOT NULL,
	`path` text NOT NULL,
	`model` text DEFAULT 'gpt-4o-mini' NOT NULL,
	`content_hash` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `summaries_user_topic_idx` ON `summaries` (`user_id`,`topic_slug`);