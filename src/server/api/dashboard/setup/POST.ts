import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }

    const auth = getAuth();
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!result) {
      return res.status(400).json({ error: 'فشل إنشاء الحساب' });
    }

    res.json({ success: true, message: 'تم إنشاء حساب المدير بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Duplicate')) {
      return res.status(409).json({ error: 'هذا البريد الإلكتروني مستخدم بالفعل' });
    }
    res.status(500).json({ error: 'حدث خطأ في الخادم', detail: msg });
  }
}
