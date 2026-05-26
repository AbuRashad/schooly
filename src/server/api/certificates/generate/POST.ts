import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { certificates } from '../../../db/schema.js';
import { createHash } from 'node:crypto';

export default async function handler(req: Request, res: Response) {
  try {
    const { studentId, schoolId, type, title, description } = req.body as {
      studentId: number;
      schoolId: number;
      type: string;
      title: string;
      description?: string;
    };

    if (!studentId || !schoolId || !type || !title) {
      return res.status(400).json({ error: 'studentId, schoolId, type, title مطلوبة' });
    }

    const hashInput = `${studentId}-${schoolId}-${type}-${title}-${Date.now()}`;
    const hash = createHash('sha256').update(hashInput).digest('hex');

    const [record] = await db.insert(certificates).values({
      studentId,
      schoolId,
      type: type as any,
      title,
      description: description ?? null,
      hash,
    });

    res.status(201).json({ success: true, id: record.insertId, hash });
  } catch (error) {
    res.status(500).json({ error: 'فشل إنشاء الشهادة', message: String(error) });
  }
}
