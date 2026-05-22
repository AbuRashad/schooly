/**
 * POST /api/dashboard/face/log
 * يسجّل حضور طالب تم التعرف عليه بالكاميرا
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { faceAttendanceLogs } from '../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { studentId, confidence } = req.body as {
      studentId: number;
      confidence: number; // 0-1
    };

    if (!studentId || confidence == null) {
      return res.status(400).json({ error: 'studentId و confidence مطلوبان' });
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().slice(0, 5);   // HH:MM

    // منع التكرار: إذا سُجّل الطالب اليوم بالفعل، لا نسجّله مرة أخرى
    const existing = await db
      .select()
      .from(faceAttendanceLogs)
      .where(and(
        eq(faceAttendanceLogs.studentId, studentId),
        eq(faceAttendanceLogs.date, date),
      ))
      .limit(1);

    if (existing.length) {
      return res.json({ success: true, alreadyLogged: true, message: 'تم تسجيل حضور هذا الطالب مسبقاً اليوم' });
    }

    await db.insert(faceAttendanceLogs).values({
      studentId,
      date,
      time,
      confidence: String((confidence * 100).toFixed(2)),
    });

    res.status(201).json({ success: true, alreadyLogged: false, date, time });
  } catch (error) {
    res.status(500).json({ error: 'فشل تسجيل الحضور', message: String(error) });
  }
}
