import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { studentPoints } from '../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { studentId, points, reason, category = 'other', awardedBy } = req.body as {
      studentId: number;
      points: number;
      reason: string;
      category?: string;
      awardedBy?: number;
    };

    if (!studentId || !points || !reason) {
      return res.status(400).json({ error: 'studentId, points, و reason مطلوبة' });
    }

    const [record] = await db.insert(studentPoints).values({
      studentId,
      points,
      reason,
      category: category as any,
      awardedBy: awardedBy ?? null,
    });

    res.status(201).json({ success: true, id: record.insertId });
  } catch (error) {
    res.status(500).json({ error: 'فشل إضافة النقاط', message: String(error) });
  }
}
