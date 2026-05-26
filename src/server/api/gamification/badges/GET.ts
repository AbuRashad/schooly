import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { studentBadges, badgeDefinitions } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { studentId } = req.query as Record<string, string>;

    if (!studentId) {
      // Return all badge definitions
      const defs = await db.select().from(badgeDefinitions).where(eq(badgeDefinitions.isActive, true));
      return res.json({ badges: defs });
    }

    const rows = await db
      .select({
        id: studentBadges.id,
        awardedAt: studentBadges.awardedAt,
        context: studentBadges.context,
        badgeCode: badgeDefinitions.code,
        badgeName: badgeDefinitions.name,
        badgeDescription: badgeDefinitions.description,
        badgeIcon: badgeDefinitions.icon,
        badgeTier: badgeDefinitions.tier,
        pointsAwarded: badgeDefinitions.pointsAwarded,
      })
      .from(studentBadges)
      .innerJoin(badgeDefinitions, eq(studentBadges.badgeId, badgeDefinitions.id))
      .where(eq(studentBadges.studentId, parseInt(studentId, 10)))
      .orderBy(studentBadges.awardedAt);

    res.json({ studentId: parseInt(studentId, 10), badges: rows });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب الشارات', message: String(error) });
  }
}
