/**
 * POST /api/dashboard/face/register
 * يحفظ بصمة وجه طالب (128-float descriptor) في قاعدة البيانات
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { faceDescriptors, students } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { studentId, descriptor } = req.body as {
      studentId: number;
      descriptor: number[]; // 128 floats من face-api.js
    };

    if (!studentId || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ error: 'بيانات غير صالحة. يجب إرسال studentId و descriptor (128 قيمة)' });
    }

    // تحقق من وجود الطالب
    const student = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student.length) return res.status(404).json({ error: 'الطالب غير موجود' });

    // احذف البصمة القديمة إن وُجدت ثم أضف الجديدة
    await db.delete(faceDescriptors).where(eq(faceDescriptors.studentId, studentId));
    await db.insert(faceDescriptors).values({
      studentId,
      descriptor: JSON.stringify(descriptor),
    });

    res.json({ success: true, message: `تم تسجيل وجه الطالب "${student[0].name}" بنجاح` });
  } catch (error) {
    res.status(500).json({ error: 'فشل تسجيل الوجه', message: String(error) });
  }
}
