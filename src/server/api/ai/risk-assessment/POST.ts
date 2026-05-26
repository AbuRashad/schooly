import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { students, attendanceRecords, riskAlerts } from '../../../db/schema.js';
import { eq, sql, and, gte } from 'drizzle-orm';

/**
 * AI Risk Assessment — Rule-based scoring
 * Weights: attendance 30%, grades 30%, behavior (status) 20%, mood 20%
 */
export default async function handler(req: Request, res: Response) {
  try {
    const { studentId } = req.body as { studentId: number };

    if (!studentId) {
      return res.status(400).json({ error: 'studentId مطلوب' });
    }

    const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) {
      return res.status(404).json({ error: 'الطالب غير موجود' });
    }

    // Attendance factor (0-100)
    const attendanceScore = Math.min(student.attendance, 100);
    const attendanceFactor = attendanceScore >= 90 ? 100 : attendanceScore >= 75 ? 70 : attendanceScore >= 50 ? 40 : 10;

    // Grade factor (0-100)
    const gradeScore = Math.min(student.grade, 100);
    const gradeFactor = gradeScore >= 80 ? 100 : gradeScore >= 60 ? 70 : gradeScore >= 40 ? 40 : 10;

    // Behavior factor based on status
    const statusWeights: Record<string, number> = {
      excellent: 100,
      good: 85,
      average: 60,
      warning: 30,
      danger: 10,
    };
    const behaviorFactor = statusWeights[student.status] ?? 50;

    // Mood factor (default 70 if no mood data)
    const moodFactor = 70;

    // Weighted risk score (inverted: higher = more risk)
    const riskScore = Math.round(
      (1 - attendanceFactor / 100) * 30 +
      (1 - gradeFactor / 100) * 30 +
      (1 - behaviorFactor / 100) * 20 +
      (1 - moodFactor / 100) * 20
    );

    const severity = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

    const factors = {
      attendance: { weight: 0.3, score: attendanceFactor, raw: student.attendance },
      grades: { weight: 0.3, score: gradeFactor, raw: student.grade },
      behavior: { weight: 0.2, score: behaviorFactor, raw: student.status },
      mood: { weight: 0.2, score: moodFactor, raw: null },
    };

    let suggestedAction = 'لا توجد إجراءات مطلوبة.';
    if (severity === 'critical') suggestedAction = 'تدخل فوري مطلوب: اجتماع مع ولي الأمر + مرشد نفسي + خطة تحسين فورية.';
    else if (severity === 'high') suggestedAction = 'مراجعة أسباب التراجع + جلسة إرشادية + متابعة أسبوعية.';
    else if (severity === 'medium') suggestedAction = 'متابعة دورية + تشجيع على المشاركة.';

    // Auto-create alert if high/critical
    if (severity === 'high' || severity === 'critical') {
      await db.insert(riskAlerts).values({
        studentId,
        riskScore,
        factors: JSON.stringify(factors),
        severity: severity as any,
        suggestedAction,
      }).catch(() => { /* ignore duplicate */ });
    }

    res.json({
      studentId,
      name: student.name,
      riskScore,
      severity,
      factors,
      suggestedAction,
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل تقييم المخاطر', message: String(error) });
  }
}
