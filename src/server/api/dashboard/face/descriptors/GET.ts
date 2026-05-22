/**
 * GET /api/dashboard/face/descriptors
 * يُرجع جميع بصمات الوجوه المسجّلة مع أسماء الطلاب
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { faceDescriptors, students } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(_req: Request, res: Response) {
  try {
    const rows = await db
      .select({
        studentId: faceDescriptors.studentId,
        descriptor: faceDescriptors.descriptor,
        name: students.name,
        class: students.class,
      })
      .from(faceDescriptors)
      .innerJoin(students, eq(faceDescriptors.studentId, students.id));

    const result = rows.map(r => ({
      studentId: r.studentId,
      name: r.name,
      class: r.class,
      descriptor: JSON.parse(r.descriptor) as number[],
    }));

    res.json({ count: result.length, descriptors: result });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب البصمات', message: String(error) });
  }
}
