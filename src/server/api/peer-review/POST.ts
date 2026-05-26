import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { peerReviews } from '../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { assignmentSubmissionId, reviewerId, revieweeId } = req.body as {
      assignmentSubmissionId: number;
      reviewerId: number;
      revieweeId: number;
    };

    if (!assignmentSubmissionId || !reviewerId || !revieweeId) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const [record] = await db.insert(peerReviews).values({
      assignmentSubmissionId,
      reviewerId,
      revieweeId,
    });

    res.status(201).json({ success: true, id: record.insertId });
  } catch (error) {
    res.status(500).json({ error: 'فشل إنشاء المراجعة', message: String(error) });
  }
}
