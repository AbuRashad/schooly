import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { moodLogs, students } from '../../../db/schema.js';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { studentId, days = '14' } = req.query as Record<string, string>;
    const lookback = parseInt(days, 10) || 14;
    const since = new Date();
    since.setDate(since.getDate() - lookback);
    const sinceStr = since.toISOString().split('T')[0];

    if (studentId) {
      const rows = await db
        .select()
        .from(moodLogs)
        .where(
          and(
            eq(moodLogs.studentId, parseInt(studentId, 10)),
            gte(moodLogs.date, sinceStr)
          )
        )
        .orderBy(moodLogs.date);

      const avg = rows.length
        ? Math.round(rows.reduce((a, r) => a + r.moodScore, 0) / rows.length * 10) / 10
        : 0;

      const trend = rows.length >= 3
        ? (rows[rows.length - 1].moodScore < rows[rows.length - 3].moodScore ? 'declining'
           : rows[rows.length - 1].moodScore > rows[rows.length - 3].moodScore ? 'improving'
           : 'stable')
        : 'unknown';

      return res.json({ history: rows, average: avg, trend, count: rows.length });
    }

    const allRecent = await db
      .select({
        studentId: moodLogs.studentId,
        studentName: students.name,
        avgMood: sql<number>`AVG(${moodLogs.moodScore})`,
        latestMood: sql<number>`MAX(${moodLogs.moodScore})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(moodLogs)
      .innerJoin(students, eq(moodLogs.studentId, students.id))
      .where(gte(moodLogs.date, sinceStr))
      .groupBy(moodLogs.studentId)
      .having(sql`COUNT(*) >= 3`);

    const atRisk = allRecent
      .filter(r => r.avgMood < 2.5)
      .map(r => ({
        studentId: r.studentId,
        name: r.studentName,
        avgMood: Math.round(r.avgMood * 10) / 10,
        latestMood: r.latestMood,
        daysLogged: r.count,
      }));

    res.json({ atRisk, totalLogged: allRecent.length });
  } catch (error) {
    res.status(500).json({ error: 'فشل تحليل المزاج', message: String(error) });
  }
}
