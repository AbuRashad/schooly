/**
 * Comprehensive Seed Script for School Smart Eye
 * Seeds all tables: academic + 11 features
 */

import { db } from './client.js';
import {
  students, attendanceRecords, faceDescriptors, faceAttendanceLogs,
  schools, campuses, academicYears, terms, gradeLevels, sections, subjects,
  staffProfiles, studentProfiles, guardianProfiles, studentGuardians,
  enrollments, badgeDefinitions, studentBadges, studentPoints,
  riskAlerts, moodLogs, inventoryItems, certificates,
} from './schema.js';

async function seed() {
  console.log('🌱 Starting comprehensive seed...\n');

  // ── 1. Schools ────────────────────────────────────────────────────────
  console.log('  📚 Seeding schools...');
  const [school] = await db.insert(schools).values({
    code: 'SCH001',
    name: 'مدرسة المستقبل',
    legalName: 'مدرسة المستقبل الخاصة',
    timezone: 'Africa/Cairo',
    locale: 'ar-EG',
    currency: 'EGP',
    isActive: true,
  });
  const schoolId = school.insertId;

  // ── 2. Campuses ───────────────────────────────────────────────────────
  console.log('  🏫 Seeding campuses...');
  await db.insert(campuses).values({
    schoolId,
    code: 'MAIN',
    name: 'الحرم الرئيسي',
    city: 'القاهرة',
    country: 'Egypt',
    isActive: true,
  });

  // ── 3. Academic Years ─────────────────────────────────────────────────
  console.log('  📅 Seeding academic years...');
  const [year] = await db.insert(academicYears).values({
    schoolId,
    name: '2025-2026',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    status: 'active',
    isCurrent: true,
  });
  const yearId = year.insertId;

  // ── 4. Terms ──────────────────────────────────────────────────────────
  console.log('  📆 Seeding terms...');
  await db.insert(terms).values([
    { academicYearId: yearId, code: 'T1', name: 'الفصل الدراسي الأول', termType: 'semester', startDate: '2025-09-01', endDate: '2026-01-31', status: 'active' },
    { academicYearId: yearId, code: 'T2', name: 'الفصل الدراسي الثاني', termType: 'semester', startDate: '2026-02-01', endDate: '2026-06-30', status: 'planned' },
  ]);

  // ── 5. Grade Levels ───────────────────────────────────────────────────
  console.log('  📊 Seeding grade levels...');
  const grades = await db.insert(gradeLevels).values([
    { schoolId, code: 'G1', name: 'الصف الأول الابتدائي', stage: 'primary', sortOrder: 1 },
    { schoolId, code: 'G2', name: 'الصف الثاني الابتدائي', stage: 'primary', sortOrder: 2 },
    { schoolId, code: 'G3', name: 'الصف الثالث الابتدائي', stage: 'primary', sortOrder: 3 },
    { schoolId, code: 'G7', name: 'الصف الأول الإعدادي', stage: 'preparatory', sortOrder: 7 },
    { schoolId, code: 'G10', name: 'الصف الأول الثانوي', stage: 'secondary', sortOrder: 10 },
  ]);

  // ── 6. Sections (Classes) ─────────────────────────────────────────────
  console.log('  🏠 Seeding sections...');
  const [section1] = await db.insert(sections).values({
    schoolId, academicYearId: yearId, gradeLevelId: grades[0].insertId,
    code: '1/A', name: '1/أ', capacity: 30,
  });
  const [section2] = await db.insert(sections).values({
    schoolId, academicYearId: yearId, gradeLevelId: grades[1].insertId,
    code: '2/A', name: '2/أ', capacity: 30,
  });

  // ── 7. Subjects ───────────────────────────────────────────────────────
  console.log('  📖 Seeding subjects...');
  await db.insert(subjects).values([
    { schoolId, code: 'MATH', name: 'الرياضيات', kind: 'core', maxMark: '100.00', passingMark: '50.00' },
    { schoolId, code: 'ARAB', name: 'اللغة العربية', kind: 'core', maxMark: '100.00', passingMark: '50.00' },
    { schoolId, code: 'ENG', name: 'اللغة الإنجليزية', kind: 'core', maxMark: '100.00', passingMark: '50.00' },
    { schoolId, code: 'SCI', name: 'العلوم', kind: 'core', maxMark: '100.00', passingMark: '50.00' },
    { schoolId, code: 'PE', name: 'التربية الرياضية', kind: 'activity', maxMark: '100.00', passingMark: '50.00' },
  ]);

  // ── 8. Staff ──────────────────────────────────────────────────────────
  console.log('  👨‍🏫 Seeding staff...');
  await db.insert(staffProfiles).values([
    { schoolId, employeeNo: 'EMP001', fullName: 'أحمد محمد', role: 'principal', isActive: true },
    { schoolId, employeeNo: 'EMP002', fullName: 'سارة علي', role: 'teacher', isActive: true },
    { schoolId, employeeNo: 'EMP003', fullName: 'خالد محمود', role: 'teacher', isActive: true },
    { schoolId, employeeNo: 'EMP004', fullName: 'فاطمة أحمد', role: 'counselor', isActive: true },
  ]);

  // ── 9. Guardians ──────────────────────────────────────────────────────
  console.log('  👨‍👩‍👧 Seeding guardians...');
  const [guardian1] = await db.insert(guardianProfiles).values({
    fullName: 'محمد أحمد', email: 'parent1@example.com', phone: '01001234567', isPrimary: true,
  });
  const [guardian2] = await db.insert(guardianProfiles).values({
    fullName: 'علي محمود', email: 'parent2@example.com', phone: '01009876543', isPrimary: true,
  });

  // ── 10. Student Profiles (Academic) ───────────────────────────────────
  console.log('  👨‍🎓 Seeding student profiles...');
  const studentData = [
    { schoolId, admissionNo: 'STU001', fullName: 'أحمد محمد', gender: 'male', joinedAt: '2023-09-01', status: 'active' },
    { schoolId, admissionNo: 'STU002', fullName: 'سارة علي', gender: 'female', joinedAt: '2023-09-01', status: 'active' },
    { schoolId, admissionNo: 'STU003', fullName: 'محمد خالد', gender: 'male', joinedAt: '2024-09-01', status: 'active' },
    { schoolId, admissionNo: 'STU004', fullName: 'فاطمة أحمد', gender: 'female', joinedAt: '2023-09-01', status: 'active' },
    { schoolId, admissionNo: 'STU005', fullName: 'عمر محمود', gender: 'male', joinedAt: '2024-09-01', status: 'active' },
    { schoolId, admissionNo: 'STU006', fullName: 'نورا حسن', gender: 'female', joinedAt: '2023-09-01', status: 'warning' },
    { schoolId, admissionNo: 'STU007', fullName: 'يوسف علي', gender: 'male', joinedAt: '2024-09-01', status: 'active' },
    { schoolId, admissionNo: 'STU008', fullName: 'ليلى محمد', gender: 'female', joinedAt: '2023-09-01', status: 'excellent' },
  ];
  const studentProfilesResult = await db.insert(studentProfiles).values(studentData);

  // ── 11. Students (School Smart Eye simplified) ────────────────────────
  console.log('  👨‍🎓 Seeding School Smart Eye students...');
  const studentsData = [
    { name: 'أحمد محمد', class: '1/أ', grade: 85, attendance: 95, status: 'excellent', gpa: '3.5' },
    { name: 'سارة علي', class: '1/أ', grade: 78, attendance: 90, status: 'good', gpa: '3.2' },
    { name: 'محمد خالد', class: '2/أ', grade: 65, attendance: 80, status: 'average', gpa: '2.5' },
    { name: 'فاطمة أحمد', class: '1/أ', grade: 92, attendance: 98, status: 'excellent', gpa: '3.8' },
    { name: 'عمر محمود', class: '2/أ', grade: 55, attendance: 70, status: 'warning', gpa: '2.0' },
    { name: 'نورا حسن', class: '2/أ', grade: 40, attendance: 60, status: 'danger', gpa: '1.5' },
    { name: 'يوسف علي', class: '1/أ', grade: 72, attendance: 85, status: 'average', gpa: '2.8' },
    { name: 'ليلى محمد', class: '1/أ', grade: 95, attendance: 100, status: 'excellent', gpa: '4.0' },
  ];
  const studentsResult = await db.insert(students).values(studentsData);

  // ── 12. Attendance Records ────────────────────────────────────────────
  console.log('  ✅ Seeding attendance records...');
  const today = new Date().toISOString().split('T')[0];
  await db.insert(attendanceRecords).values([
    { className: '1/أ', date: today, total: 4, present: 4, absent: 0, late: 0, rate: '100.00' },
    { className: '2/أ', date: today, total: 4, present: 3, absent: 1, late: 0, rate: '75.00' },
    { className: '1/أ', date: '2025-05-25', total: 4, present: 3, absent: 0, late: 1, rate: '75.00' },
    { className: '2/أ', date: '2025-05-25', total: 4, present: 2, absent: 2, late: 0, rate: '50.00' },
  ]);

  // ── 13. Badge Definitions (Gamification) ──────────────────────────────
  console.log('  🏅 Seeding badge definitions...');
  await db.insert(badgeDefinitions).values([
    { code: 'attendance_7', name: 'حضور متتالي', description: '7 أيام حضور متتالي', icon: '🔥', tier: 'bronze', criteriaType: 'attendance_streak', criteriaValue: 7, pointsAwarded: 50 },
    { code: 'attendance_30', name: 'نجم الحضور', description: '30 يوم حضور متتالي', icon: '⭐', tier: 'silver', criteriaType: 'attendance_streak', criteriaValue: 30, pointsAwarded: 200 },
    { code: 'grade_90', name: 'متفوق', description: 'حصل على 90% أو أكثر', icon: '🏆', tier: 'gold', criteriaType: 'grade_excellent', criteriaValue: 90, pointsAwarded: 100 },
    { code: 'grade_100', name: 'التميز', description: 'حصل على 100%', icon: '👑', tier: 'platinum', criteriaType: 'grade_perfect', criteriaValue: 100, pointsAwarded: 500 },
    { code: 'participation_10', name: 'مشارك نشط', description: '10 مشاركات فعالة', icon: '💬', tier: 'bronze', criteriaType: 'participation', criteriaValue: 10, pointsAwarded: 30 },
    { code: 'improvement', name: 'نجم التحسن', description: 'تحسن ملحوظ في الأداء', icon: '📈', tier: 'silver', criteriaType: 'improvement', criteriaValue: 1, pointsAwarded: 75 },
  ]);

  // ── 14. Student Badges (Gamification) ─────────────────────────────────
  console.log('  🎖️ Seeding student badges...');
  await db.insert(studentBadges).values([
    { studentId: 1, badgeId: 1, context: '7 أيام حضور متتالي' },
    { studentId: 4, badgeId: 3, context: 'درجة 92% في الرياضيات' },
    { studentId: 8, badgeId: 3, context: 'درجة 95% في العلوم' },
    { studentId: 8, badgeId: 4, context: 'درجة كاملة في الاختبار الشهري' },
  ]);

  // ── 15. Student Points (Gamification) ─────────────────────────────────
  console.log('  ⭐ Seeding student points...');
  await db.insert(studentPoints).values([
    { studentId: 1, points: 150, reason: 'حضور ممتاز', category: 'attendance' },
    { studentId: 1, points: 100, reason: 'تفوق في الرياضيات', category: 'grade' },
    { studentId: 4, points: 200, reason: 'تفوق في العلوم', category: 'grade' },
    { studentId: 8, points: 300, reason: 'تفوق مستمر', category: 'achievement' },
    { studentId: 6, points: -50, reason: 'غياب متكرر', category: 'behavior' },
  ]);

  // ── 16. Risk Alerts ───────────────────────────────────────────────────
  console.log('  🚨 Seeding risk alerts...');
  await db.insert(riskAlerts).values([
    { studentId: 6, riskScore: 85, factors: '{"attendance":0.2,"grades":0.4,"behavior":0.3,"mood":0.1}', severity: 'critical', suggestedAction: 'تدخل فوري: اجتماع مع ولي الأمر + مرشد نفسي' },
    { studentId: 5, riskScore: 60, factors: '{"attendance":0.5,"grades":0.3,"behavior":0.1,"mood":0.1}', severity: 'high', suggestedAction: 'مراجعة أسباب التراجع + جلسة إرشادية' },
  ]);

  // ── 17. Mood Logs ─────────────────────────────────────────────────────
  console.log('  🧘 Seeding mood logs...');
  await db.insert(moodLogs).values([
    { studentId: 1, moodScore: 4, date: today, note: 'يوم جيد' },
    { studentId: 1, moodScore: 5, date: '2025-05-25', note: 'سعيد جداً' },
    { studentId: 6, moodScore: 2, date: today, note: 'متضايق' },
    { studentId: 6, moodScore: 1, date: '2025-05-25', note: 'حزين' },
    { studentId: 6, moodScore: 2, date: '2025-05-24', note: 'قلق' },
  ]);

  // ── 18. Inventory ─────────────────────────────────────────────────────
  console.log('  📦 Seeding inventory...');
  await db.insert(inventoryItems).values([
    { schoolId, code: 'BOOK001', name: 'كتب الرياضيات', category: 'books', quantity: 45, minThreshold: 10, unit: 'copy', location: 'مخزن الكتب' },
    { schoolId, code: 'BOOK002', name: 'كتب العلوم', category: 'books', quantity: 8, minThreshold: 10, unit: 'copy', location: 'مخزن الكتب' },
    { schoolId, code: 'DESK001', name: 'سبورة بيضاء', category: 'furniture', quantity: 25, minThreshold: 5, unit: 'piece', location: 'المستودع الرئيسي' },
    { schoolId, code: 'LAB001', name: 'مجهر', category: 'equipment', quantity: 3, minThreshold: 2, unit: 'piece', location: 'معمل العلوم' },
    { schoolId, code: 'SPORT001', name: 'كرة قدم', category: 'sports', quantity: 12, minThreshold: 5, unit: 'piece', location: 'صالة الألعاب' },
  ]);

  // ── 19. Certificates ──────────────────────────────────────────────────
  console.log('  📜 Seeding certificates...');
  await db.insert(certificates).values([
    { studentId: 4, schoolId, type: 'achievement', title: 'شهادة التفوق الدراسي', description: 'تقدير امتياز في العلوم', hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456' },
    { studentId: 8, schoolId, type: 'achievement', title: 'شهادة الطالب المثالي', description: 'تميز في الأداء والسلوك', hash: 'b2c3d4e5f6a7890123456789012345678901abcdef2345678901abcdef234567' },
  ]);

  console.log('\n✅ Seed completed successfully!');
  console.log('   📚 Schools: 1');
  console.log('   👨‍🎓 Students: 8');
  console.log('   🏅 Badges: 6 definitions');
  console.log('   📦 Inventory: 5 items');
  console.log('   🚨 Risk Alerts: 2');
  console.log('   🧘 Mood Logs: 5');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
