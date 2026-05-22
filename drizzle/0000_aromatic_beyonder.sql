CREATE TABLE `academic_years` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`name` varchar(80) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`academic_year_status` enum('planned','active','closed') NOT NULL DEFAULT 'planned',
	`is_current` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academic_years_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_academic_year_school_name` UNIQUE(`school_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`section_id` int,
	`announcement_audience` enum('all','staff','teachers','students','guardians','section') NOT NULL DEFAULT 'all',
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`publish_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` datetime,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessment_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`student_id` int NOT NULL,
	`score` decimal(8,2) NOT NULL DEFAULT '0.00',
	`absent` boolean NOT NULL DEFAULT false,
	`feedback` text,
	`graded_by` int,
	`graded_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_assessment_result` UNIQUE(`assessment_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`academic_year_id` int NOT NULL,
	`term_id` int,
	`section_id` int NOT NULL,
	`subject_offering_id` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`assessment_type` enum('quiz','assignment','project','oral','practical','midterm','final') NOT NULL DEFAULT 'quiz',
	`max_score` decimal(8,2) NOT NULL DEFAULT '100.00',
	`weight` decimal(5,2) NOT NULL DEFAULT '0.00',
	`due_at` datetime,
	`assessment_status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
	`created_by` int,
	`published_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assignment_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignment_id` int NOT NULL,
	`student_id` int NOT NULL,
	`submission_status` enum('submitted','late','returned') NOT NULL DEFAULT 'submitted',
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`score` decimal(8,2),
	`feedback` text,
	`attachment_url` varchar(500),
	`graded_by` int,
	`graded_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignment_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_assignment_submission` UNIQUE(`assignment_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`subject_offering_id` int NOT NULL,
	`teacher_id` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`assigned_at` timestamp NOT NULL DEFAULT (now()),
	`due_at` datetime NOT NULL,
	`total_points` decimal(8,2) NOT NULL DEFAULT '100.00',
	`allow_late_submission` boolean NOT NULL DEFAULT true,
	`assignment_status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`class_name` varchar(20) NOT NULL,
	`date` varchar(20) NOT NULL,
	`total` int NOT NULL DEFAULT 0,
	`present` int NOT NULL DEFAULT 0,
	`absent` int NOT NULL DEFAULT 0,
	`late` int NOT NULL DEFAULT 0,
	`rate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `attendance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int,
	`actor_user_id` varchar(36),
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(120),
	`ip_address` varchar(64),
	`user_agent` varchar(255),
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`code` varchar(40) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address_line_1` varchar(255),
	`address_line_2` varchar(255),
	`city` varchar(120),
	`country` varchar(120) NOT NULL DEFAULT 'Egypt',
	`phone` varchar(30),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_campuses_school_code` UNIQUE(`school_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `class_attendance_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`subject_offering_id` int,
	`teacher_id` int NOT NULL,
	`session_date` date NOT NULL,
	`period_number` int NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `class_attendance_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_attendance_session` UNIQUE(`section_id`,`session_date`,`period_number`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`school_id` int NOT NULL,
	`academic_year_id` int NOT NULL,
	`grade_level_id` int NOT NULL,
	`section_id` int NOT NULL,
	`roll_number` int,
	`enrollment_date` date NOT NULL,
	`enrollment_status` enum('active','withdrawn','completed','suspended') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_enrollments_student_year` UNIQUE(`student_id`,`academic_year_id`),
	CONSTRAINT `uq_enrollments_section_roll` UNIQUE(`section_id`,`roll_number`)
);
--> statement-breakpoint
CREATE TABLE `face_attendance_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`date` varchar(20) NOT NULL,
	`time` varchar(10) NOT NULL,
	`confidence` decimal(5,2) NOT NULL DEFAULT '0.00',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `face_attendance_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `face_descriptors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`descriptor` mediumtext NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `face_descriptors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grade_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`code` varchar(40) NOT NULL,
	`name` varchar(120) NOT NULL,
	`stage` varchar(80) NOT NULL DEFAULT 'general',
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grade_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_grade_levels_school_code` UNIQUE(`school_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `guardian_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36),
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(30),
	`occupation` varchar(120),
	`is_primary` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guardian_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_guardian_user` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `homeroom_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`teacher_id` int NOT NULL,
	`academic_year_id` int NOT NULL,
	`assigned_at` timestamp NOT NULL DEFAULT (now()),
	`ended_at` datetime,
	`is_primary` boolean NOT NULL DEFAULT true,
	CONSTRAINT `homeroom_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_homeroom_section_year` UNIQUE(`section_id`,`academic_year_id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(40) NOT NULL,
	`name` varchar(255) NOT NULL,
	`legal_name` varchar(255),
	`timezone` varchar(64) NOT NULL DEFAULT 'Africa/Cairo',
	`locale` varchar(20) NOT NULL DEFAULT 'ar-EG',
	`currency` varchar(10) NOT NULL DEFAULT 'EGP',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_schools_code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`campus_id` int,
	`academic_year_id` int NOT NULL,
	`grade_level_id` int NOT NULL,
	`code` varchar(40) NOT NULL,
	`name` varchar(120) NOT NULL,
	`capacity` int NOT NULL DEFAULT 40,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_sections_school_year_code` UNIQUE(`school_id`,`academic_year_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `staff_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`user_id` varchar(36),
	`employee_no` varchar(50) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`staff_role` enum('admin','principal','coordinator','teacher','counselor','staff') NOT NULL DEFAULT 'teacher',
	`phone` varchar(30),
	`hired_at` date,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_staff_school_employee_no` UNIQUE(`school_id`,`employee_no`),
	CONSTRAINT `uq_staff_user` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `student_attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attendance_session_id` int NOT NULL,
	`student_id` int NOT NULL,
	`attendance_status` enum('present','absent','late','excused') NOT NULL DEFAULT 'present',
	`minutes_late` int NOT NULL DEFAULT 0,
	`note` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_attendance_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_student_attendance` UNIQUE(`attendance_session_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `student_guardians` (
	`student_id` int NOT NULL,
	`guardian_id` int NOT NULL,
	`guardian_relationship` enum('father','mother','guardian','relative','other') NOT NULL DEFAULT 'guardian',
	`is_emergency_contact` boolean NOT NULL DEFAULT false,
	`can_pickup` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pk_student_guardians` PRIMARY KEY(`student_id`,`guardian_id`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`legacy_student_id` int,
	`school_id` int NOT NULL,
	`user_id` varchar(36),
	`admission_no` varchar(50) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`student_gender` enum('male','female','other'),
	`date_of_birth` date,
	`national_id` varchar(40),
	`joined_at` date NOT NULL,
	`student_status` enum('active','inactive','graduated','transferred','suspended') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_student_legacy_id` UNIQUE(`legacy_student_id`),
	CONSTRAINT `uq_student_school_admission` UNIQUE(`school_id`,`admission_no`),
	CONSTRAINT `uq_student_user` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`class` varchar(20) NOT NULL,
	`grade` int NOT NULL DEFAULT 0,
	`attendance` int NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'average',
	`gpa` decimal(3,1) NOT NULL DEFAULT '0.0',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subject_offerings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`academic_year_id` int NOT NULL,
	`term_id` int,
	`section_id` int NOT NULL,
	`subject_id` int NOT NULL,
	`teacher_id` int NOT NULL,
	`weekly_periods` int NOT NULL DEFAULT 4,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subject_offerings_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_offerings_section_subject_term` UNIQUE(`section_id`,`subject_id`,`term_id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`code` varchar(40) NOT NULL,
	`name` varchar(120) NOT NULL,
	`subject_kind` enum('core','elective','activity') NOT NULL DEFAULT 'core',
	`max_mark` decimal(6,2) NOT NULL DEFAULT '100.00',
	`passing_mark` decimal(6,2) NOT NULL DEFAULT '50.00',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_subjects_school_code` UNIQUE(`school_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`academic_year_id` int NOT NULL,
	`code` varchar(40) NOT NULL,
	`name` varchar(120) NOT NULL,
	`term_type` enum('semester','trimester','quarter','custom') NOT NULL DEFAULT 'semester',
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`term_status` enum('planned','active','closed') NOT NULL DEFAULT 'planned',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `terms_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_terms_year_code` UNIQUE(`academic_year_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `timetable_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`academic_year_id` int NOT NULL,
	`term_id` int,
	`day_of_week` enum('sun','mon','tue','wed','thu','fri','sat') NOT NULL,
	`period_number` int NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`room_name` varchar(80),
	`subject_offering_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timetable_slots_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_timetable_section_term_day_period` UNIQUE(`section_id`,`term_id`,`day_of_week`,`period_number`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `academic_years` ADD CONSTRAINT `academic_years_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_created_by_staff_profiles_id_fk` FOREIGN KEY (`created_by`) REFERENCES `staff_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_results` ADD CONSTRAINT `assessment_results_assessment_id_assessments_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_results` ADD CONSTRAINT `assessment_results_student_id_student_profiles_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_results` ADD CONSTRAINT `assessment_results_graded_by_staff_profiles_id_fk` FOREIGN KEY (`graded_by`) REFERENCES `staff_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_academic_year_id_academic_years_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_term_id_terms_id_fk` FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_subject_offering_id_subject_offerings_id_fk` FOREIGN KEY (`subject_offering_id`) REFERENCES `subject_offerings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_created_by_staff_profiles_id_fk` FOREIGN KEY (`created_by`) REFERENCES `staff_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_assignment_id_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_student_id_student_profiles_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_graded_by_staff_profiles_id_fk` FOREIGN KEY (`graded_by`) REFERENCES `staff_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_subject_offering_id_subject_offerings_id_fk` FOREIGN KEY (`subject_offering_id`) REFERENCES `subject_offerings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_teacher_id_staff_profiles_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `staff_profiles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_user_id_user_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campuses` ADD CONSTRAINT `campuses_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_attendance_sessions` ADD CONSTRAINT `class_attendance_sessions_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_attendance_sessions` ADD CONSTRAINT `class_attendance_sessions_subject_offering_id_subject_offerings_id_fk` FOREIGN KEY (`subject_offering_id`) REFERENCES `subject_offerings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_attendance_sessions` ADD CONSTRAINT `class_attendance_sessions_teacher_id_staff_profiles_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `staff_profiles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_student_id_student_profiles_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_academic_year_id_academic_years_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_grade_level_id_grade_levels_id_fk` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `face_attendance_logs` ADD CONSTRAINT `face_attendance_logs_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `face_descriptors` ADD CONSTRAINT `face_descriptors_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grade_levels` ADD CONSTRAINT `grade_levels_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guardian_profiles` ADD CONSTRAINT `guardian_profiles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homeroom_assignments` ADD CONSTRAINT `homeroom_assignments_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homeroom_assignments` ADD CONSTRAINT `homeroom_assignments_teacher_id_staff_profiles_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `staff_profiles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `homeroom_assignments` ADD CONSTRAINT `homeroom_assignments_academic_year_id_academic_years_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sections` ADD CONSTRAINT `sections_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sections` ADD CONSTRAINT `sections_campus_id_campuses_id_fk` FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sections` ADD CONSTRAINT `sections_academic_year_id_academic_years_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sections` ADD CONSTRAINT `sections_grade_level_id_grade_levels_id_fk` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD CONSTRAINT `staff_profiles_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD CONSTRAINT `staff_profiles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_attendance` ADD CONSTRAINT `student_attendance_attendance_session_id_class_attendance_sessions_id_fk` FOREIGN KEY (`attendance_session_id`) REFERENCES `class_attendance_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_attendance` ADD CONSTRAINT `student_attendance_student_id_student_profiles_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_student_id_student_profiles_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_guardian_id_guardian_profiles_id_fk` FOREIGN KEY (`guardian_id`) REFERENCES `guardian_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_legacy_student_id_students_id_fk` FOREIGN KEY (`legacy_student_id`) REFERENCES `students`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subject_offerings` ADD CONSTRAINT `subject_offerings_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subject_offerings` ADD CONSTRAINT `subject_offerings_academic_year_id_academic_years_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subject_offerings` ADD CONSTRAINT `subject_offerings_term_id_terms_id_fk` FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subject_offerings` ADD CONSTRAINT `subject_offerings_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subject_offerings` ADD CONSTRAINT `subject_offerings_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subject_offerings` ADD CONSTRAINT `subject_offerings_teacher_id_staff_profiles_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `staff_profiles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `terms` ADD CONSTRAINT `terms_academic_year_id_academic_years_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_slots` ADD CONSTRAINT `timetable_slots_section_id_sections_id_fk` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_slots` ADD CONSTRAINT `timetable_slots_academic_year_id_academic_years_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_slots` ADD CONSTRAINT `timetable_slots_term_id_terms_id_fk` FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_slots` ADD CONSTRAINT `timetable_slots_subject_offering_id_subject_offerings_id_fk` FOREIGN KEY (`subject_offering_id`) REFERENCES `subject_offerings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_academic_year_school_current` ON `academic_years` (`school_id`,`is_current`);--> statement-breakpoint
CREATE INDEX `idx_announcement_school_audience` ON `announcements` (`school_id`,`announcement_audience`);--> statement-breakpoint
CREATE INDEX `idx_announcement_publish` ON `announcements` (`publish_at`);--> statement-breakpoint
CREATE INDEX `idx_assessment_result_student` ON `assessment_results` (`student_id`);--> statement-breakpoint
CREATE INDEX `idx_assessment_section` ON `assessments` (`section_id`);--> statement-breakpoint
CREATE INDEX `idx_assessment_offering` ON `assessments` (`subject_offering_id`);--> statement-breakpoint
CREATE INDEX `idx_assessment_school_year_term` ON `assessments` (`school_id`,`academic_year_id`,`term_id`);--> statement-breakpoint
CREATE INDEX `idx_assignment_submission_student` ON `assignment_submissions` (`student_id`);--> statement-breakpoint
CREATE INDEX `idx_assignment_section` ON `assignments` (`section_id`);--> statement-breakpoint
CREATE INDEX `idx_assignment_teacher` ON `assignments` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_school_created` ON `audit_logs` (`school_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_actor` ON `audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `idx_campuses_school` ON `campuses` (`school_id`);--> statement-breakpoint
CREATE INDEX `idx_attendance_session_teacher` ON `class_attendance_sessions` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `idx_enrollments_section` ON `enrollments` (`section_id`);--> statement-breakpoint
CREATE INDEX `idx_enrollments_school_year` ON `enrollments` (`school_id`,`academic_year_id`);--> statement-breakpoint
CREATE INDEX `idx_grade_levels_school_order` ON `grade_levels` (`school_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_guardian_phone` ON `guardian_profiles` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_homeroom_teacher` ON `homeroom_assignments` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `idx_sections_year_grade` ON `sections` (`academic_year_id`,`grade_level_id`);--> statement-breakpoint
CREATE INDEX `idx_staff_school_role` ON `staff_profiles` (`school_id`,`staff_role`);--> statement-breakpoint
CREATE INDEX `idx_student_attendance_student` ON `student_attendance` (`student_id`);--> statement-breakpoint
CREATE INDEX `idx_student_guardians_guardian` ON `student_guardians` (`guardian_id`);--> statement-breakpoint
CREATE INDEX `idx_student_school_status` ON `student_profiles` (`school_id`,`student_status`);--> statement-breakpoint
CREATE INDEX `idx_offerings_teacher` ON `subject_offerings` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `idx_offerings_school_year` ON `subject_offerings` (`school_id`,`academic_year_id`);--> statement-breakpoint
CREATE INDEX `idx_subjects_school_name` ON `subjects` (`school_id`,`name`);--> statement-breakpoint
CREATE INDEX `idx_terms_year` ON `terms` (`academic_year_id`);--> statement-breakpoint
CREATE INDEX `idx_timetable_offering` ON `timetable_slots` (`subject_offering_id`);