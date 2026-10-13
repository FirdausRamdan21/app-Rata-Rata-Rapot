CREATE TABLE `grades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`semester` integer NOT NULL,
	`score` real,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "grades_semester_range_check" CHECK("grades"."semester" between 1 and 6),
	CONSTRAINT "grades_score_range_check" CHECK("grades"."score" is null or ("grades"."score" >= 0 and "grades"."score" <= 100))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grades_subject_semester_unique` ON `grades` (`subject_id`,`semester`);--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	CONSTRAINT "subjects_category_check" CHECK("subjects"."category" in ('wajib', 'peminatan', 'mulok'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_name_unique` ON `subjects` (`name`);