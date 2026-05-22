import { and, eq, sql } from 'drizzle-orm';
import { closeConnection, db } from './client';
import {
  academicYears,
  enrollments,
  gradeLevels,
  schools,
  sections,
  studentProfiles,
  students,
  subjects,
} from './schema';

type GradeSeed = {
  code: string;
  name: string;
  stage: string;
  sortOrder: number;
};

type SubjectSeed = {
  code: string;
  name: string;
  kind: 'core' | 'elective' | 'activity';
};

type StudentSeed = {
  admissionNo: string;
  fullName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  sectionCode: string;
  legacyClass: string;
  legacyGrade: number;
  legacyAttendance: number;
  legacyStatus: string;
  legacyGpa: string;
};

const SCHOOL = {
  code: 'ICTM',
  name: 'ICT Master International School',
  legalName: 'ICT Master Education Services',
};

const ACADEMIC_YEAR = {
  name: '2026-2027',
  startDate: '2026-09-01',
  endDate: '2027-06-30',
  status: 'active' as const,
  isCurrent: true,
};

const GRADE_SEEDS: GradeSeed[] = [
  { code: 'G7', name: 'Grade 7', stage: 'middle', sortOrder: 7 },
  { code: 'G8', name: 'Grade 8', stage: 'middle', sortOrder: 8 },
  { code: 'G9', name: 'Grade 9', stage: 'middle', sortOrder: 9 },
];

const SECTION_SEEDS = [
  { code: 'G7-A', name: 'Grade 7 - A', gradeCode: 'G7', capacity: 35 },
  { code: 'G8-A', name: 'Grade 8 - A', gradeCode: 'G8', capacity: 35 },
  { code: 'G9-A', name: 'Grade 9 - A', gradeCode: 'G9', capacity: 35 },
];

const SUBJECT_SEEDS: SubjectSeed[] = [
  { code: 'MATH', name: 'Mathematics', kind: 'core' },
  { code: 'SCI', name: 'Science', kind: 'core' },
  { code: 'ENG', name: 'English', kind: 'core' },
  { code: 'AR', name: 'Arabic', kind: 'core' },
  { code: 'CS', name: 'Computer Science', kind: 'core' },
];

const STUDENT_SEEDS: StudentSeed[] = [
  {
    admissionNo: 'ADM-26001',
    fullName: 'Laila Hassan',
    gender: 'female',
    dateOfBirth: '2013-02-14',
    sectionCode: 'G7-A',
    legacyClass: '7A',
    legacyGrade: 91,
    legacyAttendance: 96,
    legacyStatus: 'excellent',
    legacyGpa: '3.9',
  },
  {
    admissionNo: 'ADM-26002',
    fullName: 'Omar Khaled',
    gender: 'male',
    dateOfBirth: '2012-11-03',
    sectionCode: 'G8-A',
    legacyClass: '8A',
    legacyGrade: 84,
    legacyAttendance: 90,
    legacyStatus: 'good',
    legacyGpa: '3.4',
  },
  {
    admissionNo: 'ADM-26003',
    fullName: 'Mariam Adel',
    gender: 'female',
    dateOfBirth: '2011-07-19',
    sectionCode: 'G9-A',
    legacyClass: '9A',
    legacyGrade: 88,
    legacyAttendance: 92,
    legacyStatus: 'good',
    legacyGpa: '3.6',
  },
  {
    admissionNo: 'ADM-26004',
    fullName: 'Youssef Nabil',
    gender: 'male',
    dateOfBirth: '2013-05-28',
    sectionCode: 'G7-A',
    legacyClass: '7A',
    legacyGrade: 77,
    legacyAttendance: 86,
    legacyStatus: 'average',
    legacyGpa: '3.0',
  },
];

async function getSchoolId(): Promise<number> {
  const existing = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.code, SCHOOL.code))
    .limit(1);

  if (existing[0]) return existing[0].id;

  await db.insert(schools).values(SCHOOL);

  const created = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.code, SCHOOL.code))
    .limit(1);

  if (!created[0]) throw new Error('Failed to create school');
  return created[0].id;
}

async function getAcademicYearId(schoolId: number): Promise<number> {
  const existing = await db
    .select({ id: academicYears.id })
    .from(academicYears)
    .where(and(eq(academicYears.schoolId, schoolId), eq(academicYears.name, ACADEMIC_YEAR.name)))
    .limit(1);

  if (existing[0]) return existing[0].id;

  await db.insert(academicYears).values({
    schoolId,
    ...ACADEMIC_YEAR,
  });

  const created = await db
    .select({ id: academicYears.id })
    .from(academicYears)
    .where(and(eq(academicYears.schoolId, schoolId), eq(academicYears.name, ACADEMIC_YEAR.name)))
    .limit(1);

  if (!created[0]) throw new Error('Failed to create academic year');
  return created[0].id;
}

async function seedGradeLevels(schoolId: number): Promise<Map<string, number>> {
  const byCode = new Map<string, number>();

  for (const grade of GRADE_SEEDS) {
    const existing = await db
      .select({ id: gradeLevels.id })
      .from(gradeLevels)
      .where(and(eq(gradeLevels.schoolId, schoolId), eq(gradeLevels.code, grade.code)))
      .limit(1);

    if (!existing[0]) {
      await db.insert(gradeLevels).values({ schoolId, ...grade });
    }

    const finalRow = await db
      .select({ id: gradeLevels.id })
      .from(gradeLevels)
      .where(and(eq(gradeLevels.schoolId, schoolId), eq(gradeLevels.code, grade.code)))
      .limit(1);

    if (!finalRow[0]) throw new Error(`Failed to ensure grade level ${grade.code}`);
    byCode.set(grade.code, finalRow[0].id);
  }

  return byCode;
}

async function seedSections(
  schoolId: number,
  academicYearId: number,
  gradeIds: Map<string, number>,
): Promise<Map<string, number>> {
  const byCode = new Map<string, number>();

  for (const section of SECTION_SEEDS) {
    const gradeLevelId = gradeIds.get(section.gradeCode);
    if (!gradeLevelId) throw new Error(`Missing grade ${section.gradeCode}`);

    const existing = await db
      .select({ id: sections.id })
      .from(sections)
      .where(
        and(
          eq(sections.schoolId, schoolId),
          eq(sections.academicYearId, academicYearId),
          eq(sections.code, section.code),
        ),
      )
      .limit(1);

    if (!existing[0]) {
      await db.insert(sections).values({
        schoolId,
        academicYearId,
        gradeLevelId,
        code: section.code,
        name: section.name,
        capacity: section.capacity,
      });
    }

    const finalRow = await db
      .select({ id: sections.id })
      .from(sections)
      .where(
        and(
          eq(sections.schoolId, schoolId),
          eq(sections.academicYearId, academicYearId),
          eq(sections.code, section.code),
        ),
      )
      .limit(1);

    if (!finalRow[0]) throw new Error(`Failed to ensure section ${section.code}`);
    byCode.set(section.code, finalRow[0].id);
  }

  return byCode;
}

async function seedSubjects(schoolId: number): Promise<void> {
  for (const subject of SUBJECT_SEEDS) {
    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.schoolId, schoolId), eq(subjects.code, subject.code)))
      .limit(1);

    if (!existing[0]) {
      await db.insert(subjects).values({
        schoolId,
        code: subject.code,
        name: subject.name,
        kind: subject.kind,
      });
    }
  }
}

async function getOrCreateLegacyStudent(seed: StudentSeed): Promise<number> {
  const existing = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.name, seed.fullName), eq(students.class, seed.legacyClass)))
    .limit(1);

  if (existing[0]) return existing[0].id;

  await db.insert(students).values({
    name: seed.fullName,
    class: seed.legacyClass,
    grade: seed.legacyGrade,
    attendance: seed.legacyAttendance,
    status: seed.legacyStatus,
    gpa: seed.legacyGpa,
  });

  const created = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.name, seed.fullName), eq(students.class, seed.legacyClass)))
    .limit(1);

  if (!created[0]) throw new Error(`Failed to create legacy student ${seed.fullName}`);
  return created[0].id;
}

async function seedStudents(
  schoolId: number,
  academicYearId: number,
  sectionIds: Map<string, number>,
  gradeIds: Map<string, number>,
): Promise<void> {
  const sectionRollCounters = new Map<number, number>();

  for (const studentSeed of STUDENT_SEEDS) {
    const sectionId = sectionIds.get(studentSeed.sectionCode);
    if (!sectionId) throw new Error(`Missing section ${studentSeed.sectionCode}`);

    const sectionGradeCode = SECTION_SEEDS.find((s) => s.code === studentSeed.sectionCode)?.gradeCode;
    if (!sectionGradeCode) throw new Error(`Missing grade mapping for section ${studentSeed.sectionCode}`);
    const gradeLevelId = gradeIds.get(sectionGradeCode);
    if (!gradeLevelId) throw new Error(`Missing grade id for ${sectionGradeCode}`);

    const legacyStudentId = await getOrCreateLegacyStudent(studentSeed);

    const existingProfile = await db
      .select({ id: studentProfiles.id })
      .from(studentProfiles)
      .where(and(eq(studentProfiles.schoolId, schoolId), eq(studentProfiles.admissionNo, studentSeed.admissionNo)))
      .limit(1);

    let profileId = existingProfile[0]?.id;

    if (!profileId) {
      await db.insert(studentProfiles).values({
        legacyStudentId,
        schoolId,
        admissionNo: studentSeed.admissionNo,
        fullName: studentSeed.fullName,
        gender: studentSeed.gender,
        dateOfBirth: studentSeed.dateOfBirth,
        joinedAt: ACADEMIC_YEAR.startDate,
        status: 'active',
      });

      const createdProfile = await db
        .select({ id: studentProfiles.id })
        .from(studentProfiles)
        .where(and(eq(studentProfiles.schoolId, schoolId), eq(studentProfiles.admissionNo, studentSeed.admissionNo)))
        .limit(1);

      if (!createdProfile[0]) {
        throw new Error(`Failed to create student profile ${studentSeed.admissionNo}`);
      }

      profileId = createdProfile[0].id;
    }

    const enrollmentExists = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.studentId, profileId), eq(enrollments.academicYearId, academicYearId)))
      .limit(1);

    if (!enrollmentExists[0]) {
      const currentRoll = sectionRollCounters.get(sectionId) ?? 1;
      sectionRollCounters.set(sectionId, currentRoll + 1);

      await db.insert(enrollments).values({
        studentId: profileId,
        schoolId,
        academicYearId,
        gradeLevelId,
        sectionId,
        rollNumber: currentRoll,
        enrollmentDate: ACADEMIC_YEAR.startDate,
        status: 'active',
      });
    }
  }
}

async function printSummary(schoolId: number, academicYearId: number): Promise<void> {
  const [gradeCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gradeLevels)
    .where(eq(gradeLevels.schoolId, schoolId));

  const [sectionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sections)
    .where(and(eq(sections.schoolId, schoolId), eq(sections.academicYearId, academicYearId)));

  const [subjectCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(subjects)
    .where(eq(subjects.schoolId, schoolId));

  const [studentProfileCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(studentProfiles)
    .where(eq(studentProfiles.schoolId, schoolId));

  const [enrollmentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(and(eq(enrollments.schoolId, schoolId), eq(enrollments.academicYearId, academicYearId)));

  console.log('Academic seed completed successfully');
  console.table({
    schools: 1,
    gradeLevels: Number(gradeCount?.count ?? 0),
    sections: Number(sectionCount?.count ?? 0),
    subjects: Number(subjectCount?.count ?? 0),
    students: Number(studentProfileCount?.count ?? 0),
    enrollments: Number(enrollmentCount?.count ?? 0),
  });
}

async function run(): Promise<void> {
  const schoolId = await getSchoolId();
  const academicYearId = await getAcademicYearId(schoolId);
  const gradeIds = await seedGradeLevels(schoolId);
  const sectionIds = await seedSections(schoolId, academicYearId, gradeIds);

  await seedSubjects(schoolId);
  await seedStudents(schoolId, academicYearId, sectionIds, gradeIds);
  await printSummary(schoolId, academicYearId);
}

run()
  .catch((error) => {
    console.error('Academic seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeConnection();
  });
