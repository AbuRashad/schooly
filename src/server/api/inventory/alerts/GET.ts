import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { inventoryItems } from '../../../db/schema.js';
import { sql } from 'drizzle-orm';

export default async function handler(_req: Request, res: Response) {
  try {
    const rows = await db
      .select()
      .from(inventoryItems)
      .where(sql`${inventoryItems.quantity} <= ${inventoryItems.minThreshold}`)
      .where(sql`${inventoryItems.isActive} = true`);

    res.json({ alerts: rows, count: rows.length });
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب التنبيهات', message: String(error) });
  }
}
