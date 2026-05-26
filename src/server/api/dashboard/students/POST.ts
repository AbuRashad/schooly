import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { students } from '../../../db/schema.js';

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
    const { name, class: cls, grade, attendance } = req.body as {
      name: string; class: string; grade: number; attendance: number;
    };

    if (!name?.trim()) return res.status(400).json({ error: 'اسم الطالب مطلوب' });
    if (!cls) return res.status(400).json({ error: 'الصف مطلوب' });
    if (grade == null || grade < 0 || grade > 100) return res.status(400).json({ error: 'الدرجة يجب أن تكون بين 0 و 100' });
    if (attendance == null || attendance < 0 || attendance > 100) return res.status(400).json({ error: 'نسبة الحضور يجب أن تكون بين 0 و 100' });

    const status = computeStatus(Number(grade), Number(attendance));
    const gpa = computeGpa(Number(grade));

    await db.insert(students).values({
      name: name.trim(),
      class: cls,
      grade: Number(grade),
      attendance: Number(attendance),
      status,
      gpa,
    });

    res.status(201).json({ success: true, message: 'تم إضافة الطالب بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل إضافة الطالب', message: String(error) });
  }
}
