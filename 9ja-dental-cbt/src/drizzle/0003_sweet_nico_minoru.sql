CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`subscription` text DEFAULT 'free' NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`preferences` text DEFAULT '{}' NOT NULL,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `user_preferences`;--> statement-breakpoint
-- Ensure we only keep one progress record per user before migration
DELETE FROM `user_progress`
WHERE rowid NOT IN (
	SELECT MIN(rowid)
	FROM `user_progress`
	GROUP BY `user_id`
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`total_quizzes` integer DEFAULT 0,
	`completed_quizzes` integer DEFAULT 0,
	`average_score` real DEFAULT 0,
	`best_score` integer DEFAULT 0,
	`total_questions_answered` integer DEFAULT 0,
	`correct_answers` integer DEFAULT 0,
	`total_time_spent` integer DEFAULT 0,
	`total_study_minutes` integer DEFAULT 0,
	`materials_completed` integer DEFAULT 0,
	`notes_created` integer DEFAULT 0,
	`focus_sessions` integer DEFAULT 0,
	`average_focus_time` integer DEFAULT 0,
	`specialty_stats` text DEFAULT '{}',
	`recent_activity` text DEFAULT '[]',
	`last_activity_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_progress`("id", "user_id", "total_quizzes", "completed_quizzes", "average_score", "best_score", "total_questions_answered", "correct_answers", "total_time_spent", "total_study_minutes", "materials_completed", "notes_created", "focus_sessions", "average_focus_time", "specialty_stats", "recent_activity", "last_activity_date", "created_at", "updated_at") SELECT "id", "user_id", "total_quizzes", "completed_quizzes", "average_score", "best_score", "total_questions_answered", "correct_answers", "total_time_spent", "total_study_minutes", "materials_completed", "notes_created", "focus_sessions", "average_focus_time", "specialty_stats", "recent_activity", "last_activity_date", "created_at", "updated_at" FROM `user_progress`;--> statement-breakpoint
DROP TABLE `user_progress`;--> statement-breakpoint
ALTER TABLE `__new_user_progress` RENAME TO `user_progress`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_progress_user_idx` ON `user_progress` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `daily_activity_user_day_idx` ON `daily_activity` (`user_id`,`activity_date`);