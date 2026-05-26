import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { students, studentPoints, studentBadges, badgeDefinitions } from '../../../db/schema.js';
import { sql, eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { classFilter = '', limit = '10' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(limit, 10) || 10, 50);

    // Calculate total points per student
    const pointsSubquery = db
      .select({
        studentId: studentPoints.studentId,
        totalPoints: sql<number>`COALESCE(SUM(${studentPoints.points}), 0)`.as('total_points'),
      })
      .from(studentPoints)
      .groupBy(studentPoints.studentId)
      .as('points_sq');

    // Count badges per student
    const badgesSubquery = db
      .select({
        studentId: studentBadges.studentId,
        badgeCount: sql<number>`COUNT(*)`.as('badge_count'),
      })
      .from(studentBadges)
      .groupBy(studentBadges.studentId)
      .as('badges_sq');

    let query = db
      .select({
        id: students.id,
        name: students.name,
        class: students.class,
        grade: students.grade,
        attendance: students.attendance,
        totalPoints: sql<number>`COALESCE(${pointsSubquery.totalPoints}, 0)`,
        badgeCount: sql<number>`COALESCE(${badgesSubquery.badgeCount}, 0)`,
      })
      .from(students)
      .leftJoin(pointsSubquery, eq(students.id, pointsSubquery.studentId))
      .leftJoin(badgesSubquery, eq(students.id, badgesSubquery.studentId));

    if (classFilter) {
      query = query.where(eq(students.class, classFilter)) as typeof query;
    }

    const rows = await query.orderBy(desc(sql`COALESCE(${pointsSubquery.totalPoints}, 0)`)).limit(take);

    const leaderboard = rows.map((r, i) => ({
      rank: i + 1,
      ...r,
    }));

    res.json({ leaderboard, total: leaderboard.length });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب لوحة المتصدرين', message: String(error) });
  }
}
