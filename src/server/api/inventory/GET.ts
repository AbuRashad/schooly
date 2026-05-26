import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { inventoryItems } from '../../db/schema.js';
import { eq, like, and, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { search = '', category = '', lowStock = 'false' } = req.query as Record<string, string>;

    let query = db.select().from(inventoryItems);
    const conditions = [];

    if (search) {
      conditions.push(like(inventoryItems.name, `%${search}%`));
    }
    if (category) {
      conditions.push(eq(inventoryItems.category, category));
    }
    if (lowStock === 'true') {
      conditions.push(sql`${inventoryItems.quantity} <= ${inventoryItems.minThreshold}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const rows = await query.orderBy(inventoryItems.name);
    res.json({ items: rows, total: rows.length });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب المخزون', message: String(error) });
  }
}
