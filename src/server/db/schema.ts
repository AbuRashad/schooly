/**
 * Drizzle ORM schema entrypoint.
 * Includes BetterAuth required tables + School Smart Eye tables.
 */

import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  int,
  decimal,
  mediumtext,
  date,
  datetime,
  mysqlEnum,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const session = mysqlTable('session', {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = mysqlTable('account', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ── Academic Platform Core Model ─────────────────────────────────────────────

export const schools = mysqlTable('schools', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 40 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }),
  timezone: varchar('timezone', { length: 64 }).notNull().default('Africa/Cairo'),
  locale: varchar('locale', { length: 20 }).notNull().default('ar-EG'),
  currency: varchar('currency', { length: 10 }).notNull().default('EGP'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  schoolCodeUnique: uniqueIndex('uq_schools_code').on(table.code),
}));

export const campuses = mysqlTable('campuses', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 40 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  addressLine1: varchar('address_line_1', { length: 255 }),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 120 }),
  country: varchar('country', { length: 120 }).notNull().default('Egypt'),
  phone: varchar('phone', { length: 30 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  campusSchoolCodeUnique: uniqueIndex('uq_campuses_school_code').on(table.schoolId, table.code),
  campusSchoolIdx: index('idx_campuses_school').on(table.schoolId),
}));

export const academicYearStatusEnum = mysqlEnum('academic_year_status', ['planned', 'active', 'closed']);

export const academicYears = mysqlTable('academic_years', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 80 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: academicYearStatusEnum.notNull().default('planned'),
  isCurrent: boolean('is_current').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  yearSchoolNameUnique: uniqueIndex('uq_academic_year_school_name').on(table.schoolId, table.name),
  yearSchoolCurrentIdx: index('idx_academic_year_school_current').on(table.schoolId, table.isCurrent),
}));

export const termTypeEnum = mysqlEnum('term_type', ['semester', 'trimester', 'quarter', 'custom']);
export const termStatusEnum = mysqlEnum('term_status', ['planned', 'active', 'closed']);

export const terms = mysqlTable('terms', {
  id: int('id').primaryKey().autoincrement(),
  academicYearId: int('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 40 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  termType: termTypeEnum.notNull().default('semester'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: termStatusEnum.notNull().default('planned'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  termYearCodeUnique: uniqueIndex('uq_terms_year_code').on(table.academicYearId, table.code),
  termYearIdx: index('idx_terms_year').on(table.academicYearId),
}));

export const gradeLevels = mysqlTable('grade_levels', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 40 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  stage: varchar('stage', { length: 80 }).notNull().default('general'),
  sortOrder: int('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  gradeSchoolCodeUnique: uniqueIndex('uq_grade_levels_school_code').on(table.schoolId, table.code),
  gradeSchoolOrderIdx: index('idx_grade_levels_school_order').on(table.schoolId, table.sortOrder),
}));

export const sections = mysqlTable('sections', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  campusId: int('campus_id').references(() => campuses.id, { onDelete: 'set null' }),
  academicYearId: int('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  gradeLevelId: int('grade_level_id').notNull().references(() => gradeLevels.id, { onDelete: 'restrict' }),
  code: varchar('code', { length: 40 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  capacity: int('capacity').notNull().default(40),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  sectionSchoolYearCodeUnique: uniqueIndex('uq_sections_school_year_code').on(table.schoolId, table.academicYearId, table.code),
  sectionYearGradeIdx: index('idx_sections_year_grade').on(table.academicYearId, table.gradeLevelId),
}));

export const subjectKindEnum = mysqlEnum('subject_kind', ['core', 'elective', 'activity']);

export const subjects = mysqlTable('subjects', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 40 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  kind: subjectKindEnum.notNull().default('core'),
  maxMark: decimal('max_mark', { precision: 6, scale: 2 }).notNull().default('100.00'),
  passingMark: decimal('passing_mark', { precision: 6, scale: 2 }).notNull().default('50.00'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  subjectSchoolCodeUnique: uniqueIndex('uq_subjects_school_code').on(table.schoolId, table.code),
  subjectSchoolNameIdx: index('idx_subjects_school_name').on(table.schoolId, table.name),
}));

export const staffRoleEnum = mysqlEnum('staff_role', ['admin', 'principal', 'coordinator', 'teacher', 'counselor', 'staff']);

export const staffProfiles = mysqlTable('staff_profiles', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  employeeNo: varchar('employee_no', { length: 50 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: staffRoleEnum.notNull().default('teacher'),
  phone: varchar('phone', { length: 30 }),
  hiredAt: date('hired_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  staffSchoolEmployeeNoUnique: uniqueIndex('uq_staff_school_employee_no').on(table.schoolId, table.employeeNo),
  staffUserUnique: uniqueIndex('uq_staff_user').on(table.userId),
  staffSchoolRoleIdx: index('idx_staff_school_role').on(table.schoolId, table.role),
}));

export const guardianProfiles = mysqlTable('guardian_profiles', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  occupation: varchar('occupation', { length: 120 }),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  guardianUserUnique: uniqueIndex('uq_guardian_user').on(table.userId),
  guardianPhoneIdx: index('idx_guardian_phone').on(table.phone),
}));

export const studentStatusEnum = mysqlEnum('student_status', ['active', 'inactive', 'graduated', 'transferred', 'suspended']);
export const studentGenderEnum = mysqlEnum('student_gender', ['male', 'female', 'other']);

export const studentProfiles = mysqlTable('student_profiles', {
  id: int('id').primaryKey().autoincrement(),
  legacyStudentId: int('legacy_student_id').references(() => students.id, { onDelete: 'set null' }),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  admissionNo: varchar('admission_no', { length: 50 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  gender: studentGenderEnum,
  dateOfBirth: date('date_of_birth'),
  nationalId: varchar('national_id', { length: 40 }),
  joinedAt: date('joined_at').notNull(),
  status: studentStatusEnum.notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  studentLegacyUnique: uniqueIndex('uq_student_legacy_id').on(table.legacyStudentId),
  studentSchoolAdmissionUnique: uniqueIndex('uq_student_school_admission').on(table.schoolId, table.admissionNo),
  studentUserUnique: uniqueIndex('uq_student_user').on(table.userId),
  studentSchoolStatusIdx: index('idx_student_school_status').on(table.schoolId, table.status),
}));

export const guardianRelationshipEnum = mysqlEnum('guardian_relationship', ['father', 'mother', 'guardian', 'relative', 'other']);

export const studentGuardians = mysqlTable('student_guardians', {
  studentId: int('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  guardianId: int('guardian_id').notNull().references(() => guardianProfiles.id, { onDelete: 'cascade' }),
  relationship: guardianRelationshipEnum.notNull().default('guardian'),
  isEmergencyContact: boolean('is_emergency_contact').notNull().default(false),
  canPickup: boolean('can_pickup').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.studentId, table.guardianId], name: 'pk_student_guardians' }),
  guardianIdx: index('idx_student_guardians_guardian').on(table.guardianId),
}));

export const enrollmentStatusEnum = mysqlEnum('enrollment_status', ['active', 'withdrawn', 'completed', 'suspended']);

export const enrollments = mysqlTable('enrollments', {
  id: int('id').primaryKey().autoincrement(),
  studentId: int('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  academicYearId: int('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  gradeLevelId: int('grade_level_id').notNull().references(() => gradeLevels.id, { onDelete: 'restrict' }),
  sectionId: int('section_id').notNull().references(() => sections.id, { onDelete: 'restrict' }),
  rollNumber: int('roll_number'),
  enrollmentDate: date('enrollment_date').notNull(),
  status: enrollmentStatusEnum.notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  enrollmentStudentYearUnique: uniqueIndex('uq_enrollments_student_year').on(table.studentId, table.academicYearId),
  enrollmentSectionRollUnique: uniqueIndex('uq_enrollments_section_roll').on(table.sectionId, table.rollNumber),
  enrollmentSectionIdx: index('idx_enrollments_section').on(table.sectionId),
  enrollmentSchoolYearIdx: index('idx_enrollments_school_year').on(table.schoolId, table.academicYearId),
}));

export const homeroomAssignments = mysqlTable('homeroom_assignments', {
  id: int('id').primaryKey().autoincrement(),
  sectionId: int('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  teacherId: int('teacher_id').notNull().references(() => staffProfiles.id, { onDelete: 'restrict' }),
  academicYearId: int('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  endedAt: datetime('ended_at'),
  isPrimary: boolean('is_primary').notNull().default(true),
}, (table) => ({
  homeroomSectionYearUnique: uniqueIndex('uq_homeroom_section_year').on(table.sectionId, table.academicYearId),
  homeroomTeacherIdx: index('idx_homeroom_teacher').on(table.teacherId),
}));

export const subjectOfferings = mysqlTable('subject_offerings', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  academicYearId: int('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  termId: int('term_id').references(() => terms.id, { onDelete: 'set null' }),
  sectionId: int('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  subjectId: int('subject_id').notNull().references(() => subjects.id, { onDelete: 'restrict' }),
  teacherId: int('teacher_id').notNull().references(() => staffProfiles.id, { onDelete: 'restrict' }),
  weeklyPeriods: int('weekly_periods').notNull().default(4),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  offeringSectionSubjectTermUnique: uniqueIndex('uq_offerings_section_subject_term').on(table.sectionId, table.subjectId, table.termId),
  offeringTeacherIdx: index('idx_offerings_teacher').on(table.teacherId),
  offeringSchoolYearIdx: index('idx_offerings_school_year').on(table.schoolId, table.academicYearId),
}));

export const dayOfWeekEnum = mysqlEnum('day_of_week', ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);

export const timetableSlots = mysqlTable('timetable_slots', {
  id: int('id').primaryKey().autoincrement(),
  sectionId: int('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  academicYearId: int('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  termId: int('term_id').references(() => terms.id, { onDelete: 'set null' }),
  dayOfWeek: dayOfWeekEnum.notNull(),
  periodNumber: int('period_number').notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),
  roomName: varchar('room_name', { length: 80 }),
  subjectOfferingId: int('subject_offering_id').notNull().references(() => subjectOfferings.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  timetableSectionTermDayPeriodUnique: uniqueIndex('uq_timetable_section_term_day_period').on(table.sectionId, table.termId, table.dayOfWeek, table.periodNumber),
  timetableOfferingIdx: index('idx_timetable_offering').on(table.subjectOfferingId),
}));

export const classAttendanceSessions = mysqlTable('attendance_sessions', {
  id: int('id').primaryKey().autoincrement(),
  sectionId: int('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  offeringId: int('offering_id').references(() => subjectOfferings.id, { onDelete: 'set null' }),
  teacherId: int('teacher_id').notNull().references(() => staffProfiles.id, { onDelete: 'restrict' }),
  sessionDate: date('session_date').notNull(),
  periodNumber: int('period_number').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  attendanceSessionUnique: uniqueIndex('uq_attendance_session').on(table.sectionId, table.sessionDate, table.periodNumber),
  attendanceSessionTeacherIdx: index('idx_attendance_session_teacher').on(table.teacherId),
}));

export const attendanceStatusEnum = mysqlEnum('attendance_status', ['present', 'absent', 'late', 'excused']);

export const studentAttendance = mysqlTable('student_attendance', {
  id: int('id').primaryKey().autoincrement(),
  sessionId: int('session_id').notNull().references(() => classAttendanceSessions.id, { onDelete: 'cascade' }),
  studentId: int('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  status: attendanceStatusEnum.notNull().default('present'),
  minutesLate: int('minutes_late').notNull().default(0),
  note: varchar('note', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  studentAttendanceUnique: uniqueIndex('uq_student_attendance').on(table.sessionId, table.studentId),
  studentAttendanceStudentIdx: index('idx_student_attendance_student').on(table.studentId),
}));

export const assessmentTypeEnum = mysqlEnum('assessment_type', ['quiz', 'assignment', 'project', 'oral', 'practical', 'midterm', 'final']);
export const assessmentStatusEnum = mysqlEnum('assessment_status', ['draft', 'published', 'closed']);

export const assessments = mysqlTable('assessments', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  academicYearId: int('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  termId: int('term_id').references(() => terms.id, { onDelete: 'set null' }),
  sectionId: int('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  subjectOfferingId: int('subject_offering_id').notNull().references(() => subjectOfferings.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  type: assessmentTypeEnum.notNull().default('quiz'),
  maxScore: decimal('max_score', { precision: 8, scale: 2 }).notNull().default('100.00'),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull().default('0.00'),
  dueAt: datetime('due_at'),
  status: assessmentStatusEnum.notNull().default('draft'),
  createdBy: int('created_by').references(() => staffProfiles.id, { onDelete: 'set null' }),
  publishedAt: datetime('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  assessmentSectionIdx: index('idx_assessment_section').on(table.sectionId),
  assessmentOfferingIdx: index('idx_assessment_offering').on(table.subjectOfferingId),
  assessmentSchoolYearTermIdx: index('idx_assessment_school_year_term').on(table.schoolId, table.academicYearId, table.termId),
}));

export const assessmentResults = mysqlTable('assessment_results', {
  id: int('id').primaryKey().autoincrement(),
  assessmentId: int('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  studentId: int('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  score: decimal('score', { precision: 8, scale: 2 }).notNull().default('0.00'),
  absent: boolean('absent').notNull().default(false),
  feedback: text('feedback'),
  gradedBy: int('graded_by').references(() => staffProfiles.id, { onDelete: 'set null' }),
  gradedAt: datetime('graded_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  assessmentResultUnique: uniqueIndex('uq_assessment_result').on(table.assessmentId, table.studentId),
  assessmentResultStudentIdx: index('idx_assessment_result_student').on(table.studentId),
}));

export const assignmentStatusEnum = mysqlEnum('assignment_status', ['draft', 'published', 'closed']);
export const submissionStatusEnum = mysqlEnum('submission_status', ['submitted', 'late', 'returned']);

export const assignments = mysqlTable('assignments', {
  id: int('id').primaryKey().autoincrement(),
  sectionId: int('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  subjectOfferingId: int('subject_offering_id').notNull().references(() => subjectOfferings.id, { onDelete: 'cascade' }),
  teacherId: int('teacher_id').notNull().references(() => staffProfiles.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  dueAt: datetime('due_at').notNull(),
  totalPoints: decimal('total_points', { precision: 8, scale: 2 }).notNull().default('100.00'),
  allowLateSubmission: boolean('allow_late_submission').notNull().default(true),
  status: assignmentStatusEnum.notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  assignmentSectionIdx: index('idx_assignment_section').on(table.sectionId),
  assignmentTeacherIdx: index('idx_assignment_teacher').on(table.teacherId),
}));

export const assignmentSubmissions = mysqlTable('assignment_submissions', {
  id: int('id').primaryKey().autoincrement(),
  assignmentId: int('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  studentId: int('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  status: submissionStatusEnum.notNull().default('submitted'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  score: decimal('score', { precision: 8, scale: 2 }),
  feedback: text('feedback'),
  attachmentUrl: varchar('attachment_url', { length: 500 }),
  gradedBy: int('graded_by').references(() => staffProfiles.id, { onDelete: 'set null' }),
  gradedAt: datetime('graded_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  assignmentSubmissionUnique: uniqueIndex('uq_assignment_submission').on(table.assignmentId, table.studentId),
  assignmentSubmissionStudentIdx: index('idx_assignment_submission_student').on(table.studentId),
}));

export const announcementAudienceEnum = mysqlEnum('announcement_audience', ['all', 'staff', 'teachers', 'students', 'guardians', 'section']);

export const announcements = mysqlTable('announcements', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  sectionId: int('section_id').references(() => sections.id, { onDelete: 'set null' }),
  audience: announcementAudienceEnum.notNull().default('all'),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body').notNull(),
  publishAt: timestamp('publish_at').notNull().defaultNow(),
  expiresAt: datetime('expires_at'),
  createdBy: int('created_by').references(() => staffProfiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  announcementSchoolAudienceIdx: index('idx_announcement_school_audience').on(table.schoolId, table.audience),
  announcementPublishIdx: index('idx_announcement_publish').on(table.publishAt),
}));

export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  schoolId: int('school_id').references(() => schools.id, { onDelete: 'set null' }),
  actorUserId: varchar('actor_user_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 120 }),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: varchar('user_agent', { length: 255 }),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  auditSchoolCreatedIdx: index('idx_audit_school_created').on(table.schoolId, table.createdAt),
  auditActorIdx: index('idx_audit_actor').on(table.actorUserId),
}));

// ── School Smart Eye Tables ──────────────────────────────────────────

export const students = mysqlTable('students', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  class: varchar('class', { length: 20 }).notNull(),
  grade: int('grade').notNull().default(0),          // overall grade %
  attendance: int('attendance').notNull().default(0), // attendance %
  status: varchar('status', { length: 20 }).notNull().default('average'), // excellent|good|average|warning|danger
  gpa: decimal('gpa', { precision: 3, scale: 1 }).notNull().default('0.0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const attendanceRecords = mysqlTable('attendance_records', {
  id: int('id').primaryKey().autoincrement(),
  className: varchar('class_name', { length: 20 }).notNull(),
  date: varchar('date', { length: 20 }).notNull(), // YYYY-MM-DD
  total: int('total').notNull().default(0),
  present: int('present').notNull().default(0),
  absent: int('absent').notNull().default(0),
  late: int('late').notNull().default(0),
  rate: decimal('rate', { precision: 5, scale: 2 }).notNull().default('0.00'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Face Recognition ─────────────────────────────────────────────────
// يخزّن بصمة الوجه (128-float descriptor) لكل طالب
export const faceDescriptors = mysqlTable('face_descriptors', {
  id: int('id').primaryKey().autoincrement(),
  studentId: int('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  descriptor: mediumtext('descriptor').notNull(), // JSON array of 128 floats
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// سجل حضور يومي لكل طالب (مرتبط بالتعرف على الوجه)
export const faceAttendanceLogs = mysqlTable('face_attendance_logs', {
  id: int('id').primaryKey().autoincrement(),
  studentId: int('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  date: varchar('date', { length: 20 }).notNull(),       // YYYY-MM-DD
  time: varchar('time', { length: 10 }).notNull(),        // HH:MM
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull().default('0.00'),
  createdAt: timestamp('created_at').defaultNow(),
});
