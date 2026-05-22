import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { students } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

function computeStatus(grade: number, attendance: number): string {
  if (grade >= 90 && attendance >= 90) return 'excellent';
  if (grade >= 80 && attendance >= 80) return 'good';
  if (grade >= 70 && attendance >= 70) return 'average';
  if (attendance < 70 || grade < 65) return 'danger';
  return 'warning';
}

function computeGpa(grade: number): string {
  if (grade >= 95) return '4.0';
  if (grade >= 90) return '3.7';
  if (grade >= 85) return '3.5';
  if (grade >= 80) return '3.3';
  if (grade >= 75) return '3.0';
  if (grade >= 70) return '2.7';
  if (grade >= 65) return '2.5';
  if (grade >= 60) return '2.2';
  return '1.5';
}

export default async function handler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'معرّف غير صالح' });

    const { name, class: cls, grade, attendance } = req.body as {
      name: string; class: string; grade: number; attendance: number;
    };

    if (!name?.trim()) return res.status(400).json({ error: 'اسم الطالب مطلوب' });
    if (!cls) return res.status(400).json({ error: 'الصف مطلوب' });
    if (grade == null || grade < 0 || grade > 100) return res.status(400).json({ error: 'الدرجة يجب أن تكون بين 0 و 100' });
    if (attendance == null || attendance < 0 || attendance > 100) return res.status(400).json({ error: 'نسبة الحضور يجب أن تكون بين 0 و 100' });

    const existing = await db.select().from(students).where(eq(students.id, id)).limit(1);
    if (!existing.length) return res.status(404).json({ error: 'الطالب غير موجود' });

    const status = computeStatus(Number(grade), Number(attendance));
    const gpa = computeGpa(Number(grade));

    await db.update(students)
      .set({ name: name.trim(), class: cls, grade: Number(grade), attendance: Number(attendance), status, gpa })
      .where(eq(students.id, id));

    res.json({ success: true, message: 'تم تحديث بيانات الطالب بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل تحديث الطالب', message: String(error) });
  }
}
