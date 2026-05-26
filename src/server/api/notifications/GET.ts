import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { riskAlerts, parentNotifications, students } from '../../db/schema.js';
import { desc, eq, sql } from 'drizzle-orm';

export default async function handler(_req: Request, res: Response) {
  try {
    // Get recent risk alerts (open)
    const alerts = await db
      .select({
        id: riskAlerts.id,
        type: sql<string>`'risk'`,
        title: sql<string>`CONCAT('تنبيه: ', ${students.name})`,
        message: riskAlerts.suggestedAction,
        severity: riskAlerts.severity,
        studentId: riskAlerts.studentId,
        createdAt: riskAlerts.createdAt,
      })
      .from(riskAlerts)
      .leftJoin(students, eq(riskAlerts.studentId, students.id))
      .where(eq(riskAlerts.status, 'open'))
      .orderBy(desc(riskAlerts.createdAt))
      .limit(5);

    // Get unread parent notifications
    const notifications = await db
      .select({
        id: parentNotifications.id,
        type: sql<string>`'parent'`,
        title: parentNotifications.title,
        message: parentNotifications.body,
        severity: sql<string>`'low'`,
        createdAt: parentNotifications.createdAt,
      })
      .from(parentNotifications)
      .where(eq(parentNotifications.isRead, false))
      .orderBy(desc(parentNotifications.createdAt))
      .limit(5);

    const all = [...alerts, ...notifications]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 8)
      .map((n, i) => ({
        id: n.id ?? i,
        type: n.type,
        title: n.title ?? 'إشعار',
        message: (n.message ?? '').substring(0, 80),
        severity: n.severity ?? 'low',
        time: formatTimeAgo(n.createdAt),
        read: false,
      }));

    res.json({ notifications: all, unreadCount: all.length });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications', message: String(error) });
  }
}

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return 'الآن';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return then.toLocaleDateString('ar-EG');
}
