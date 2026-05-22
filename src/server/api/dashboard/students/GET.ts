import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { students } from '../../../db/schema.js';
import { like, eq, or, and, SQL } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { search = '', classFilter = '', status = '' } = req.query as Record<string, string>;

    const conditions: SQL[] = [];

    if (search) {
      conditions.push(
        or(
          like(students.name, `%${search}%`),
          like(students.class, `%${search}%`)
        ) as SQL
      );
    }
    if (classFilter) {
      conditions.push(eq(students.class, classFilter));
    }
    if (status) {
      conditions.push(eq(students.status, status));
    }

    const query = db.select().from(students);
    const result = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    // Convert decimal gpa to number
    const mapped = result.map(s => ({
      ...s,
      gpa: Number(s.gpa),
    }));

    res.json({ students: mapped, total: mapped.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students', message: String(error) });
  }
}
