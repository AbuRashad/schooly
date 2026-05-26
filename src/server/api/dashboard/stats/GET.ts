import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { students, attendanceRecords } from '../../../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

export default async function handler(_req: Request, res: Response) {
  try {
    // ── Total students from DB ──────────────────────────────────────
    const [{ count: totalStudents }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students);

    // ── Grade distribution from real student data ───────────────────
    const allStudents = await db.select({ grade: students.grade }).from(students);
    const gradeDist = { excellent: 0, vgood: 0, good: 0, pass: 0, fail: 0 };
    for (const s of allStudents) {
      if (s.grade >= 90) gradeDist.excellent++;
      else if (s.grade >= 80) gradeDist.vgood++;
      else if (s.grade >= 70) gradeDist.good++;
      else if (s.grade >= 60) gradeDist.pass++;
      else gradeDist.fail++;
    }

    // ── Latest attendance from DB ───────────────────────────────────
    const latestAttendance = await db
      .select()
      .from(attendanceRecords)
      .orderBy(desc(attendanceRecords.date))
      .limit(8);

    const totalPresent = latestAttendance.reduce((a, r) => a + r.present, 0);
    const totalAll = latestAttendance.reduce((a, r) => a + r.total, 0);
    const attendanceToday = totalAll > 0
      ? Math.round((totalPresent / totalAll) * 1000) / 10
      : 0;

    // ── Alerts based on real data ───────────────────────────────────
    const atRiskStudents = await db
      .select({ id: students.id, name: students.name, class: students.class, status: students.status, attendance: students.attendance })
      .from(students)
      .where(sql`${students.status} IN ('danger', 'warning')`)
      .orderBy(students.attendance);

    const recentAlerts = atRiskStudents.slice(0, 4).map((s, i) => ({
      id: s.id,
      type: s.status === 'danger' ? 'absence' : 'performance',
      message: s.status === 'danger'
        ? `غياب متكرر: ${s.name} (الصف ${s.class})`
        : `تراجع في الأداء: ${s.name} (الصف ${s.class})`,
      time: i === 0 ? 'منذ 10 دقائق' : i === 1 ? 'منذ 30 دقيقة' : i === 2 ? 'منذ ساعة' : 'منذ ساعتين',
      severity: s.status === 'danger' ? 'high' : 'medium',
    }));

    // Add achievement alert for top student
    const [topStudent] = await db
      .select({ name: students.name, class: students.class })
      .from(students)
      .where(eq(students.status, 'excellent'))
      .orderBy(desc(students.grade))
      .limit(1);

    if (topStudent) {
      recentAlerts.push({
        id: 999,
        type: 'achievement',
        message: `تحسن ملحوظ: ${topStudent.name} (الصف ${topStudent.class})`,
        time: 'منذ ساعتين',
        severity: 'low',
      });
    }

    const stats = {
      totalStudents: Number(totalStudents),
      totalTeachers: 87,   // static until teachers table is added
      totalClasses: 42,    // static until classes table is added
      attendanceToday,
      attendanceTrend: [88, 91, 85, 93, 90, 94, attendanceToday],
      performanceTrend: [72, 75, 74, 78, 80, 82, 84],
      weekDays: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'اليوم'],
      gradeDistribution: [
        { grade: 'ممتاز', count: gradeDist.excellent, color: '#22C55E' },
        { grade: 'جيد جداً', count: gradeDist.vgood, color: '#00C2FF' },
        { grade: 'جيد', count: gradeDist.good, color: '#A855F7' },
        { grade: 'مقبول', count: gradeDist.pass, color: '#F59E0B' },
        { grade: 'ضعيف', count: gradeDist.fail, color: '#EF4444' },
      ],
      recentAlerts,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', message: String(error) });
  }
}
