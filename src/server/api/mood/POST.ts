import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { moodLogs } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { studentId, moodScore, note, date } = req.body as {
      studentId: number;
      moodScore: number;
      note?: string;
      date?: string;
    };

    if (!studentId || !moodScore || moodScore < 1 || moodScore > 5) {
      return res.status(400).json({ error: 'studentId و moodScore (1-5) مطلوبة' });
    }

    const targetDate = date ?? new Date().toISOString().split('T')[0];

    // Upsert: delete existing log for this student+date, then insert
    await db.delete(moodLogs).where(
      and(eq(moodLogs.studentId, studentId), eq(moodLogs.date, targetDate))
    );

    const [record] = await db.insert(moodLogs).values({
      studentId,
      moodScore,
      note: note ?? null,
      date: targetDate,
    });

    res.status(201).json({ success: true, id: record.insertId });
  } catch (error) {
    res.status(500).json({ error: 'فشل تسجيل المزاج', message: String(error) });
  }
}
