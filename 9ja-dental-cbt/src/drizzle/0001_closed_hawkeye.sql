CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`difficulty` text NOT NULL,
	`icon` text,
	`criteria` text NOT NULL,
	`points_reward` integer DEFAULT 0,
	`xp_reward` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_name_unique` ON `achievements` (`name`);--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`notes` text,
	`tags` text,
	`is_favorite` integer DEFAULT false,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `daily_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`activity_date` text NOT NULL,
	`questions_answered` integer DEFAULT 0,
	`correct_answers` integer DEFAULT 0,
	`study_minutes` integer DEFAULT 0,
	`quizzes_completed` integer DEFAULT 0,
	`login_count` integer DEFAULT 0,
	`streak_maintained` integer DEFAULT false,
	`points_earned` integer DEFAULT 0,
	`xp_earned` integer DEFAULT 0,
	`activities` text DEFAULT '[]',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`specialty_id` text NOT NULL,
	`text` text NOT NULL,
	`options` text NOT NULL,
	`correct_answer` integer NOT NULL,
	`explanation` text,
	`difficulty` text NOT NULL,
	`type` text DEFAULT 'mcq',
	`time_estimate` integer DEFAULT 60,
	`tags` text,
	`image_url` text,
	`reference` text,
	`points` integer DEFAULT 10,
	`is_active` integer DEFAULT true,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`question_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`quiz_id` text,
	`quiz_type` text NOT NULL,
	`specialty_id` text,
	`score` integer NOT NULL,
	`correct_answers` integer NOT NULL,
	`total_questions` integer NOT NULL,
	`time_taken` integer NOT NULL,
	`answers_data` text NOT NULL,
	`passed` integer NOT NULL,
	`points_earned` integer DEFAULT 0,
	`xp_earned` integer DEFAULT 0,
	`completed_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `quiz_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quiz_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`quiz_id` text,
	`quiz_type` text NOT NULL,
	`specialty_id` text,
	`current_question` integer DEFAULT 0,
	`total_questions` integer NOT NULL,
	`questions_data` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`time_limit` integer,
	`is_completed` integer DEFAULT false,
	`is_paused` integer DEFAULT false,
	`pause_time` integer,
	`resume_time` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`specialty_id` text,
	`difficulty` text NOT NULL,
	`total_questions` integer DEFAULT 20 NOT NULL,
	`time_limit` integer,
	`quiz_type` text DEFAULT 'practice',
	`passing_score` integer DEFAULT 70,
	`tags` text,
	`is_featured` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `specialties` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `specialties_name_unique` ON `specialties` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `specialties_slug_unique` ON `specialties` (`slug`);--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_type` text NOT NULL,
	`specialty_id` text,
	`duration` integer NOT NULL,
	`topics_covered` text,
	`questions_reviewed` integer DEFAULT 0,
	`notes` text,
	`goals_set` text,
	`goals_achieved` text,
	`quality_rating` integer,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`setting_key` text NOT NULL,
	`setting_value` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'general',
	`is_public` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `system_settings_setting_key_unique` ON `system_settings` (`setting_key`);--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`progress` integer DEFAULT 0,
	`max_progress` integer NOT NULL,
	`is_completed` integer DEFAULT false,
	`completed_at` integer,
	`points_earned` integer DEFAULT 0,
	`xp_earned` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`theme` text DEFAULT 'system',
	`notifications` integer DEFAULT true,
	`difficulty` text DEFAULT 'medium',
	`study_reminders` integer DEFAULT true,
	`language` text DEFAULT 'en',
	`timezone` text DEFAULT 'UTC',
	`email_notifications` integer DEFAULT true,
	`push_notifications` integer DEFAULT true,
	`preferred_study_time` text,
	`daily_goal` integer DEFAULT 10,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`specialty_id` text,
	`total_questions_answered` integer DEFAULT 0,
	`correct_answers` integer DEFAULT 0,
	`accuracy_rate` real DEFAULT 0,
	`average_time_per_question` integer DEFAULT 0,
	`total_study_time` integer DEFAULT 0,
	`questions_per_difficulty` text DEFAULT '{"easy": 0, "medium": 0, "hard": 0}',
	`weekly_goals` text DEFAULT '{}',
	`monthly_goals` text DEFAULT '{}',
	`last_activity_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_streaks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`streak_type` text NOT NULL,
	`current_count` integer DEFAULT 0,
	`best_count` integer DEFAULT 0,
	`last_activity_date` text,
	`streak_start_date` text,
	`streak_data` text DEFAULT '{}',
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
