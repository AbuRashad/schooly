import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { attendanceRecords } from '../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { date } = req.query as Record<string, string>;

    // Get latest date if not specified
    let targetDate = date;
    if (!targetDate) {
      const latest = await db
        .select({ date: attendanceRecords.date })
        .from(attendanceRecords)
        .orderBy(desc(attendanceRecords.date))
        .limit(1);
      targetDate = latest[0]?.date ?? new Date().toISOString().split('T')[0];
    }

    const records = await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.date, targetDate));

    const classes = records.map((r, i) => ({
      id: r.id,
      name: `الصف ${r.className}`,
      total: r.total,
      present: r.present,
      absent: r.absent,
      late: r.late,
      rate: Number(r.rate),
    }));

    const totalStudents = classes.reduce((a, c) => a + c.total, 0);
    const totalPresent = classes.reduce((a, c) => a + c.present, 0);
    const totalAbsent = classes.reduce((a, c) => a + c.absent, 0);
    const totalLate = classes.reduce((a, c) => a + c.late, 0);
    const overallRate = totalStudents > 0
      ? Math.round((totalPresent / totalStudents) * 1000) / 10
      : 0;

    const summary = {
      totalStudents,
      totalPresent,
      totalAbsent,
      totalLate,
      overallRate,
      date: new Date(targetDate + 'T00:00:00').toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }),
    };

    res.json({ classes, summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance', message: String(error) });
  }
}
