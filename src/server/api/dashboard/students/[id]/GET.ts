import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import {
  students, studentBadges, badgeDefinitions, studentPoints,
  moodLogs, riskAlerts, attendanceRecords,
} from '../../../../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'معرف الطالب غير صالح' });
    }

    // ── Basic student info ──────────────────────────────────────────────
    const [student] = await db.select().from(students).where(eq(students.id, id));
    if (!student) {
      return res.status(404).json({ error: 'الطالب غير موجود' });
    }

    // ── Total points ────────────────────────────────────────────────────
    const [pointsRow] = await db
      .select({ total: sql<number>`COALESCE(SUM(${studentPoints.points}), 0)` })
      .from(studentPoints)
      .where(eq(studentPoints.studentId, id));

    // ── Badges earned ───────────────────────────────────────────────────
    const badges = await db
      .select({
        code: badgeDefinitions.code,
        name: badgeDefinitions.name,
        description: badgeDefinitions.description,
        icon: badgeDefinitions.icon,
        tier: badgeDefinitions.tier,
        awardedAt: studentBadges.awardedAt,
      })
      .from(studentBadges)
      .innerJoin(badgeDefinitions, eq(studentBadges.badgeId, badgeDefinitions.id))
      .where(eq(studentBadges.studentId, id))
      .orderBy(desc(studentBadges.awardedAt));

    // ── Mood history (last 30 days) ─────────────────────────────────────
    const moodHistory = await db
      .select()
      .from(moodLogs)
      .where(eq(moodLogs.studentId, id))
      .orderBy(desc(moodLogs.date))
      .limit(30);

    // ── Risk alert (if any) ─────────────────────────────────────────────
    const [riskAlert] = await db
      .select()
      .from(riskAlerts)
      .where(eq(riskAlerts.studentId, id))
      .orderBy(desc(riskAlerts.computedAt))
      .limit(1);

    // ── Attendance records for this student's class ─────────────────────
    const attendance = await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.className, student.class))
      .orderBy(desc(attendanceRecords.date))
      .limit(14);

    // ── Points history ──────────────────────────────────────────────────
    const pointsHistory = await db
      .select()
      .from(studentPoints)
      .where(eq(studentPoints.studentId, id))
      .orderBy(desc(studentPoints.createdAt))
      .limit(20);

    res.json({
      student: {
        ...student,
        gpa: Number(student.gpa),
        totalPoints: Number(pointsRow?.total ?? 0),
      },
      badges,
      moodHistory: moodHistory.map(m => ({
        ...m,
        moodScore: Number(m.moodScore),
      })),
      riskAlert: riskAlert ?? null,
      attendance: attendance.map(a => ({
        ...a,
        rate: Number(a.rate),
      })),
      pointsHistory: pointsHistory.map(p => ({
        ...p,
        points: Number(p.points),
      })),
    });
  } catch (error) {
    console.error('Student detail error:', error);
    res.status(500).json({ error: 'فشل جلب بيانات الطالب', message: String(error) });
  }
}
