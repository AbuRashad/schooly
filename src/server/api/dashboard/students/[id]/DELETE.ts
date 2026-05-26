import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { students } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'معرّف غير صالح' });

    const existing = await db.select().from(students).where(eq(students.id, id)).limit(1);
    if (!existing.length) return res.status(404).json({ error: 'الطالب غير موجود' });

    await db.delete(students).where(eq(students.id, id));

    res.json({ success: true, message: 'تم حذف الطالب بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل حذف الطالب', message: String(error) });
  }
}
