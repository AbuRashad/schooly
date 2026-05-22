import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { students, attendanceRecords } from '../../../db/schema.js';
import { eq, gte, lte, and } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { type = 'students', classFilter = '', dateFrom = '', dateTo = '' } = req.query as Record<string, string>;

    if (type === 'students') {
      // ── تقرير الطلاب ─────────────────────────────────────────────
      const conditions = [];
      if (classFilter) conditions.push(eq(students.class, classFilter));

      const rows = conditions.length
        ? await db.select().from(students).where(and(...conditions))
        : await db.select().from(students);

      // إحصائيات ملخصة
      const total = rows.length;
      const excellent = rows.filter(s => s.status === 'excellent').length;
      const good      = rows.filter(s => s.status === 'good').length;
      const average   = rows.filter(s => s.status === 'average').length;
      const warning   = rows.filter(s => s.status === 'warning').length;
      const danger    = rows.filter(s => s.status === 'danger').length;
      const avgGrade  = total ? Math.round(rows.reduce((a, s) => a + s.grade, 0) / total) : 0;
      const avgAttend = total ? Math.round(rows.reduce((a, s) => a + s.attendance, 0) / total) : 0;
      const avgGpa    = total ? (rows.reduce((a, s) => a + Number(s.gpa), 0) / total).toFixed(2) : '0.00';

      return res.json({
        type: 'students',
        generatedAt: new Date().toISOString(),
        filters: { classFilter },
        summary: { total, excellent, good, average, warning, danger, avgGrade, avgAttend, avgGpa },
        rows: rows.map(s => ({ ...s, gpa: Number(s.gpa) })),
      });
    }

    if (type === 'attendance') {
      // ── تقرير الحضور ─────────────────────────────────────────────
      const conditions = [];
      if (classFilter) conditions.push(eq(attendanceRecords.className, classFilter));
      if (dateFrom)    conditions.push(gte(attendanceRecords.date, dateFrom));
      if (dateTo)      conditions.push(lte(attendanceRecords.date, dateTo));

      const rows = conditions.length
        ? await db.select().from(attendanceRecords).where(and(...conditions))
        : await db.select().from(attendanceRecords);

      const totalPresent = rows.reduce((a, r) => a + r.present, 0);
      const totalAbsent  = rows.reduce((a, r) => a + r.absent, 0);
      const totalLate    = rows.reduce((a, r) => a + r.late, 0);
      const totalAll     = rows.reduce((a, r) => a + r.total, 0);
      const overallRate  = totalAll ? Math.round((totalPresent / totalAll) * 1000) / 10 : 0;

      return res.json({
        type: 'attendance',
        generatedAt: new Date().toISOString(),
        filters: { classFilter, dateFrom, dateTo },
        summary: { totalRecords: rows.length, totalPresent, totalAbsent, totalLate, totalAll, overallRate },
        rows: rows.map(r => ({ ...r, rate: Number(r.rate) })),
      });
    }

    res.status(400).json({ error: 'نوع التقرير غير صالح. استخدم: students | attendance' });
  } catch (error) {
    res.status(500).json({ error: 'فشل توليد التقرير', message: String(error) });
  }
}
